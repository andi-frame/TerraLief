from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.ocr import extract_text_easyocr, extract_text_google, extract_text_trocr
from app.services.parser import parse_supply_text
from app.services.estimation import compute_best_route

router = APIRouter()

@router.post("/best-route")
def get_best_route(data: dict):
    # routes = data.get("routes", [])
    # destination = data.get("destination", "")
    # result = compute_best_route(routes, destination)
    # return result
    return {"message": "Best route calculation placeholder"}

def _process(image_bytes: bytes, extractor) -> dict:
    raw_text = extractor(image_bytes)
    parsed_items = parse_supply_text(raw_text)
    return {
        "raw_text": raw_text,
        "items": [
            {
                "nama_barang": item.nama_barang,
                "jumlah": item.jumlah,
                "satuan": item.satuan,
            }
            for item in parsed_items
        ],
        "total_items": len(parsed_items),
    }


@router.post("/ocr/easyocr")
async def ocr_easyocr(image: UploadFile = File(...)):
    """OCR menggunakan EasyOCR — lokal, tidak butuh API key."""
    image_bytes = await image.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="File gambar kosong")
    return _process(image_bytes, extract_text_easyocr)


@router.post("/ocr/google")
async def ocr_google(image: UploadFile = File(...)):
    """OCR menggunakan Google Cloud Vision API — butuh GOOGLE_API_KEY di .env."""
    image_bytes = await image.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="File gambar kosong")
    return _process(image_bytes, extract_text_google)


@router.post("/ocr/trocr")
async def ocr_trocr(image: UploadFile = File(...)):
    """OCR menggunakan TrOCR (Microsoft) — auto-detect tulisan tangan vs cetak.

    - Deteksi region: EasyOCR CRAFT
    - Pengenalan: trocr-base-handwritten ATAU trocr-base-printed (otomatis)
    - Tidak butuh API key, berjalan lokal.
    - Model diunduh otomatis dari HuggingFace saat pertama kali dipakai (~400MB).
    """
    image_bytes = await image.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="File gambar kosong")
    return _process(image_bytes, extract_text_trocr)
