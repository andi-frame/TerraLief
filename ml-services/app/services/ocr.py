import io
import os
from PIL import Image, ImageOps
import easyocr
import numpy as np
import base64
import urllib.request
import json
import torch
from transformers import TrOCRProcessor, VisionEncoderDecoderModel



_easyocr_reader = None



def _preprocess(image_bytes: bytes) -> bytes:
    """
    Preprocess untuk handwriting OCR:
    1. Grayscale    — normalisasi warna tinta (biru/hitam/merah jadi sama)
    2. Autocontrast — atasi pencahayaan tidak merata (foto kertas)
    3. Upscale 3x   — angka kecil lebih mudah dideteksi

    Note: JANGAN sharpen — terbukti merusak deteksi digit (7 → {)
    """
    img = Image.open(io.BytesIO(image_bytes)).convert("L")   # grayscale
    img = ImageOps.autocontrast(img, cutoff=2)               # normalize brightness
    w, h = img.size
    img = img.resize((w * 3, h * 3), Image.LANCZOS)         # upscale 3x
    img = img.convert("RGB")                                 # EasyOCR butuh RGB
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def _easyocr_extract(image_bytes: bytes) -> str:
    global _easyocr_reader

    if _easyocr_reader is None:
        _easyocr_reader = easyocr.Reader(["id", "en"], gpu=False, verbose=False)

    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img_array = np.array(img)

    # detail=1 → kembalikan [(bbox, text, confidence), ...]
    results = _easyocr_reader.readtext(
        img_array,
        detail=1,
        paragraph=False,
        # Deteksi karakter dengan kontras rendah (tinta tipis/pudar)
        text_threshold=0.4,
        low_text=0.3,
        contrast_ths=0.3,
        adjust_contrast=0.7,
    )

    # Rekonstruksi baris dari bounding box (Y position)
    return _bbox_to_rows(results)


def _bbox_to_rows(results: list) -> str:
    """
    Susun teks berdasarkan posisi spasial bounding box.

    Strategi untuk handwriting:
    1. Pisahkan kolom kanan (jumlah) dari body utama berdasarkan distribusi X
    2. Group body utama ke baris menggunakan gap antar Y
    3. Pasangkan kolom kanan ke baris di bawahnya (handwriting tulis angka
       antara baris, sehingga angka sering berada DI ATAS item-nya)
    """
    if not results:
        return ""

    segments = []
    for bbox, text, _ in results:
        xs = [p[0] for p in bbox]
        ys = [p[1] for p in bbox]
        x_center = (min(xs) + max(xs)) / 2
        y_center = (min(ys) + max(ys)) / 2
        height   = max(ys) - min(ys)
        segments.append((y_center, x_center, height, _fix_digits(text.strip())))

    if not segments:
        return ""

    # ── Pisahkan kolom kanan ──────────────────────────────────────────────
    # Kolom paling kanan (jumlah) memiliki X jauh lebih besar dari yang lain.
    # Gunakan 75th percentile X sebagai batas.
    all_x = sorted(s[1] for s in segments)
    x_threshold = all_x[int(len(all_x) * 0.75)]

    right_col = [s for s in segments if s[1] >= x_threshold]
    main_body = [s for s in segments if s[1] <  x_threshold]

    # Jika semua segmen di satu kolom, proses semua sebagai main_body
    if not main_body:
        main_body = right_col
        right_col = []

    # ── Group main_body ke baris ──────────────────────────────────────────
    main_body.sort(key=lambda s: s[0])
    avg_h = sum(s[2] for s in main_body) / len(main_body)

    # Threshold = separuh gap terkecil antar kelompok baris.
    # Gunakan median gap sebagai estimasi intra-row spacing.
    gaps = [abs(main_body[i+1][0] - main_body[i][0]) for i in range(len(main_body)-1)]
    if gaps:
        median_gap = sorted(gaps)[len(gaps)//2]
        row_threshold = max(median_gap * 1.2, avg_h * 0.5)
    else:
        row_threshold = avg_h * 0.8

    rows: list[list[tuple]] = _group_rows(main_body, row_threshold)

    # ── Pasangkan kolom kanan ke baris ───────────────────────────────────
    # Angka jumlah handwriting sering ditulis DI ATAS baris itemnya,
    # sehingga kita cari baris pertama yang center-Y-nya >= Y angka.
    row_centers = [sum(r[0] for r in row) / len(row) for row in rows]

    for seg in sorted(right_col, key=lambda s: s[0]):
        # Cari baris pertama yang berada DI BAWAH atau sejajar angka
        below = [(i, cy) for i, cy in enumerate(row_centers) if cy >= seg[0]]
        if below:
            target = min(below, key=lambda t: t[1])[0]
        else:
            # Fallback: baris terdekat
            target = min(range(len(row_centers)), key=lambda i: abs(row_centers[i] - seg[0]))
        rows[target].append(seg)

    # ── Format output ─────────────────────────────────────────────────────
    lines = []
    for row in rows:
        row.sort(key=lambda s: s[1])           # kiri → kanan
        lines.append("\t".join(s[3] for s in row))

    return "\n".join(lines)


# Karakter yang sering salah dibaca sebagai digit
_DIGIT_TRANS = str.maketrans({
    "(": "1", ")": "1",   # ( → 1
    "[": "7", "]": "7",   # [ → 7
    "{": "7", "}": "7",   # { → 7
    "O": "0", "o": "0",   # O → 0
    "I": "1", "l": "1",   # I/l → 1
    "T": "1",             # T → 1  (TrOCR sering baca "1" sebagai "T")
    "S": "5",             # S → 5
    "Z": "2",             # Z → 2
})


def _fix_digits(text: str) -> str:
    """
    Perbaiki token yang seharusnya angka tapi salah karena OCR confusion.
    Hanya diterapkan jika setelah koreksi seluruh token jadi digit murni.
    """
    corrected = text.translate(_DIGIT_TRANS)
    return corrected if corrected.isdigit() else text


def _group_rows(segments: list, threshold: float) -> list[list[tuple]]:
    rows: list[list[tuple]] = [[segments[0]]]
    for seg in segments[1:]:
        if abs(seg[0] - rows[-1][-1][0]) <= threshold:
            rows[-1].append(seg)
        else:
            rows.append([seg])
    return rows


def _google_vision_extract(image_bytes: bytes) -> str:

    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        raise RuntimeError("GOOGLE_API_KEY tidak ditemukan di environment variables")

    url = f"https://vision.googleapis.com/v1/images:annotate?key={api_key}"

    payload = json.dumps({
        "requests": [{
            "image": {"content": base64.b64encode(image_bytes).decode("utf-8")},
            "features": [{"type": "DOCUMENT_TEXT_DETECTION"}],
        }]
    }).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    with urllib.request.urlopen(req) as resp:
        result = json.loads(resp.read())

    responses = result.get("responses", [{}])
    if responses[0].get("error"):
        raise RuntimeError(f"Google Vision error: {responses[0]['error']['message']}")

    annotation = responses[0].get("fullTextAnnotation", {})

    # Ekstrak word-level bounding boxes untuk rekonstruksi baris yang akurat
    segments = []
    for page in annotation.get("pages", []):
        for block in page.get("blocks", []):
            for para in block.get("paragraphs", []):
                for word in para.get("words", []):
                    text = "".join(s["text"] for s in word.get("symbols", []))
                    vertices = word.get("boundingBox", {}).get("vertices", [])
                    if len(vertices) == 4:
                        bbox = [[v.get("x", 0), v.get("y", 0)] for v in vertices]
                        segments.append((bbox, text, 1.0))

    if segments:
        return _bbox_to_rows(segments)

    # Fallback ke raw text jika tidak ada bounding box
    return annotation.get("text", "")


# ── TrOCR dual-model engine ───────────────────────────────────────────────────

_trocr_models: dict = {}   # cache: {"handwritten": (processor, model), "printed": (...)}


def _is_handwritten(image_bytes: bytes) -> bool:
    """
    Heuristic: deteksi apakah gambar adalah tulisan tangan atau cetak.

    Tulisan tangan → variasi intensitas lokal lebih tinggi (stroke tidak rata).
    Cetak → edge lebih tajam, distribusi piksel lebih bimodal.

    Gunakan standard deviation dari gradient magnitude sebagai proxy.
    Threshold dikalibrasi secara empiris: stddev > 30 → handwritten.
    """


    img = Image.open(io.BytesIO(image_bytes)).convert("L")
    arr = np.array(img, dtype=np.float32)

    # Sobel gradient (sederhana)
    gx = np.diff(arr, axis=1)
    gy = np.diff(arr, axis=0)
    # Potong ke ukuran yang sama
    min_h = min(gx.shape[0], gy.shape[0])
    min_w = min(gx.shape[1], gy.shape[1])
    magnitude = np.sqrt(gx[:min_h, :min_w] ** 2 + gy[:min_h, :min_w] ** 2)

    return float(magnitude.std()) > 30.0


def _load_trocr(model_type: str):
    """Lazy-load TrOCR processor+model. Cache setelah load pertama."""
    global _trocr_models
    if model_type in _trocr_models:
        return _trocr_models[model_type]

    

    model_name = (
        "microsoft/trocr-base-handwritten"
        if model_type == "handwritten"
        else "microsoft/trocr-base-printed"
    )
    processor = TrOCRProcessor.from_pretrained(model_name)
    model = VisionEncoderDecoderModel.from_pretrained(model_name)
    model.eval()
    _trocr_models[model_type] = (processor, model)
    return processor, model


def _trocr_recognize_crop(crop: "Image.Image", model_type: str) -> str:
    """Jalankan TrOCR inference pada satu crop gambar."""


    processor, model = _load_trocr(model_type)
    pixel_values = processor(images=crop.convert("RGB"), return_tensors="pt").pixel_values
    with torch.no_grad():
        ids = model.generate(pixel_values)
    return processor.batch_decode(ids, skip_special_tokens=True)[0].strip()


def _trocr_extract(image_bytes: bytes) -> str:
    """
    Pipeline TrOCR:
    1. Auto-detect handwriting vs cetak
    2. Gunakan EasyOCR CRAFT untuk deteksi region teks (bounding box)
    3. Crop tiap region → TrOCR recognition
    4. Susun baris via _bbox_to_rows
    """
    global _easyocr_reader
 
    # Auto-detect tipe teks
    model_type = "handwritten" if _is_handwritten(image_bytes) else "printed"

    # Preprocess & load ke numpy
    processed = _preprocess(image_bytes)
    img_pil = Image.open(io.BytesIO(processed)).convert("RGB")
    img_array = np.array(img_pil)

    # Deteksi region menggunakan CRAFT (EasyOCR detector)
    if _easyocr_reader is None:
        _easyocr_reader = easyocr.Reader(["id", "en"], gpu=False, verbose=False)

    horizontal_list, _ = _easyocr_reader.detect(img_array)

    results = []
    for bbox_group in horizontal_list:
        for x_min, x_max, y_min, y_max in bbox_group:
            x_min, x_max = int(x_min), int(x_max)
            y_min, y_max = int(y_min), int(y_max)

            # Tambah sedikit padding agar karakter di tepi tidak terpotong
            pad = 4
            x_min = max(0, x_min - pad)
            y_min = max(0, y_min - pad)
            x_max = min(img_pil.width, x_max + pad)
            y_max = min(img_pil.height, y_max + pad)

            if x_max <= x_min or y_max <= y_min:
                continue

            crop = img_pil.crop((x_min, y_min, x_max, y_max))
            text = _trocr_recognize_crop(crop, model_type)
            if not text:
                continue

            bbox = [[x_min, y_min], [x_max, y_min], [x_max, y_max], [x_min, y_max]]
            results.append((bbox, text, 1.0))

    return _bbox_to_rows(results)


def extract_text_trocr(image_bytes: bytes) -> str:
    """Extract text menggunakan TrOCR (auto-detect handwriting vs printed)."""
    return _trocr_extract(image_bytes)


def extract_text_easyocr(image_bytes: bytes) -> str:
    """Extract text menggunakan EasyOCR (lokal, tidak butuh API key)."""
    return _easyocr_extract(_preprocess(image_bytes))


def extract_text_google(image_bytes: bytes) -> str:
    """Extract text menggunakan Google Cloud Vision API."""
    return _google_vision_extract(_preprocess(image_bytes))

