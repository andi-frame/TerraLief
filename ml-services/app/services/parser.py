import re
from dataclasses import dataclass

# Satuan umum yang mungkin muncul setelah angka
_SATUAN = {
    "dus", "karung", "botol", "pak", "pcs", "buah", "kg", "liter",
    "ltr", "lusin", "kodi", "bungkus", "sachet", "lembar", "helai",
    "kotak", "kaleng", "galon", "unit", "set",
}

# Header keywords yang biasa ada di baris judul tabel — diabaikan
_HEADER_KEYWORDS = re.compile(
    r"^(no\.?|jenis\s*barang|nama\s*barang|barang|jumlah|qty|keterangan|satuan)[\s\|\-]*$",
    re.IGNORECASE,
)

# Separator karakter tabel: |, tab, 2+ spasi berturutan
_TABLE_SPLIT = re.compile(r"\s*[\|]\s*|\t+|\s{2,}")

_PATTERN_ITEM_FIRST = re.compile(
    r"^([a-zA-Z][a-zA-Z0-9\s\-\.]*?)\s*[:\-=]?\s*(\d+)\s*([a-zA-Z]*)\s*$",
    re.IGNORECASE,
)
_PATTERN_NUM_FIRST = re.compile(
    r"^(\d+)\s+([a-zA-Z][a-zA-Z0-9\s\-\.]+?)\s*$",
    re.IGNORECASE,
)


@dataclass
class ParsedItem:
    nama_barang: str
    jumlah: int | None
    satuan: str | None
    confidence: str  # "high" | "low"


def parse_supply_text(raw_text: str) -> list[ParsedItem]:
    """
    Parse raw OCR text into structured supply items.

    Handles two formats:
    1. List format:
       - "selimut 5"
       - "selimut: 5 dus"
       - "5 selimut"

    2. Table format (dengan atau tanpa header):
       Jenis Barang  | Jumlah
       selimut       | 5
       indomie       | 10
    """
    lines = [l.strip() for l in raw_text.splitlines() if l.strip()]

    if _is_table(lines):
        return _parse_table(lines)
    return _parse_list(lines)


# ── Table detection ──────────────────────────────────────────────────────────

def _is_table(lines: list[str]) -> bool:
    """Heuristic: tabel jika ada baris dengan separator | atau banyak kolom."""
    if not lines:
        return False
    pipe_count = sum(1 for l in lines if "|" in l)
    if pipe_count >= 2:
        return True
    # Cek kolom via spasi/tab ganda
    col_count = sum(1 for l in lines if len(_TABLE_SPLIT.split(l)) >= 2)
    return col_count >= max(2, len(lines) // 2)


def _parse_table(lines: list[str]) -> list[ParsedItem]:
    """Parse baris-baris tabel menjadi ParsedItem."""
    results: list[ParsedItem] = []
    nama_col: int | None = None
    jumlah_col: int | None = None

    for line in lines:
        cols = [c.strip() for c in _TABLE_SPLIT.split(line) if c.strip()]
        if not cols:
            continue

        # Deteksi baris header
        if _is_header_row(cols):
            nama_col, jumlah_col = _detect_columns(cols)
            continue

        # Skip baris pemisah (---, ===, dll)
        if all(c in "-=+" for c in "".join(cols)):
            continue

        item = _parse_table_row(cols, nama_col, jumlah_col)
        if item:
            results.append(item)

    return results


def _is_header_row(cols: list[str]) -> bool:
    # Butuh minimal 2 kolom yang cocok keyword header,
    # supaya row data yang kebetulan mengandung kata "barang"/"jumlah" tidak ikut dilewati
    matches = sum(1 for c in cols if _HEADER_KEYWORDS.match(c))
    return matches >= 2


def _detect_columns(header_cols: list[str]) -> tuple[int | None, int | None]:
    """Tentukan index kolom nama barang dan jumlah dari header."""
    nama_idx = jumlah_idx = None
    for i, col in enumerate(header_cols):
        col_lower = col.lower()
        if any(k in col_lower for k in ("barang", "jenis", "nama", "item")):
            nama_idx = i
        elif any(k in col_lower for k in ("jumlah", "qty", "jml", "amount")):
            jumlah_idx = i
    return nama_idx, jumlah_idx


def _parse_table_row(
    cols: list[str],
    nama_col: int | None,
    jumlah_col: int | None,
) -> ParsedItem | None:
    if len(cols) < 2:
        return None

    # Skip baris yang col pertama adalah nomor urut (1, 2, 3, ...)
    start = 0
    if cols[0].isdigit() and len(cols) >= 3:
        start = 1
        cols = cols[start:]

    # Jika header terdeteksi, pakai index kolom
    if nama_col is not None and jumlah_col is not None:
        n_idx = nama_col - start if nama_col - start >= 0 else 0
        j_idx = jumlah_col - start if jumlah_col - start >= 0 else 1
        if n_idx < len(cols) and j_idx < len(cols):
            return _build_item(cols[n_idx], cols[j_idx])

    # Fallback: coba setiap pasangan (text, angka) atau (angka, text)
    for i, col in enumerate(cols):
        if col.isdigit():
            # Kolom sebelumnya adalah nama
            if i > 0 and re.match(r"[a-zA-Z]", cols[i - 1]):
                return _build_item(cols[i - 1], col)
            # Kolom sesudahnya adalah nama
            if i < len(cols) - 1 and re.match(r"[a-zA-Z]", cols[i + 1]):
                return _build_item(cols[i + 1], col)

    # Tidak ada digit sama sekali — tetap return nama jika ada kolom teks valid
    text_cols = [c for c in cols if re.match(r"[a-zA-Z]{2,}", c)]
    if text_cols:
        nama = _clean_name(text_cols[0])
        if nama:
            confidence = "high" if len(nama) >= 3 else "low"
            return ParsedItem(nama_barang=nama, jumlah=None, satuan=None, confidence=confidence)

    return None


def _build_item(nama_raw: str, jumlah_raw: str) -> ParsedItem | None:
    nama = _clean_name(nama_raw)
    if not nama:
        return None
    jumlah = int(jumlah_raw) if jumlah_raw.isdigit() else None
    confidence = "high" if len(nama) >= 3 else "low"
    return ParsedItem(nama_barang=nama, jumlah=jumlah, satuan=None, confidence=confidence)


# ── List format ───────────────────────────────────────────────────────────────

def _parse_list(lines: list[str]) -> list[ParsedItem]:
    results: list[ParsedItem] = []
    for line in lines:
        if len(line) < 3:
            continue
        item = _parse_line(line)
        if item:
            results.append(item)
    return results


def _parse_line(line: str) -> ParsedItem | None:
    m = _PATTERN_ITEM_FIRST.match(line)
    if m:
        nama = _clean_name(m.group(1))
        jumlah = int(m.group(2))
        satuan_raw = m.group(3).strip().lower()
        satuan = satuan_raw if satuan_raw in _SATUAN else None
        confidence = "high" if len(nama) >= 3 else "low"
        return ParsedItem(nama_barang=nama, jumlah=jumlah, satuan=satuan, confidence=confidence)

    m = _PATTERN_NUM_FIRST.match(line)
    if m:
        jumlah = int(m.group(1))
        nama = _clean_name(m.group(2))
        confidence = "high" if len(nama) >= 3 else "low"
        return ParsedItem(nama_barang=nama, jumlah=jumlah, satuan=None, confidence=confidence)

    return None


def _clean_name(name: str) -> str:
    return re.sub(r"\s+", " ", name.strip()).lower()
