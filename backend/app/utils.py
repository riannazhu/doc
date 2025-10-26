import pdfplumber
import pytesseract
from PIL import Image
from io import BytesIO

def extract_text_pages_from_pdf_bytes(file_bytes: bytes) -> list[str]:
    pages_text: list[str] = []
    with pdfplumber.open(BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            text = (page.extract_text() or "").strip()
            if text:
                pages_text.append(text)
            else:
                # Rasterize page at 200 DPI for OCR
                pil_img = page.to_image(resolution=200).original
                ocr_text = pytesseract.image_to_string(pil_img) or ""
                pages_text.append(ocr_text.strip())
    return pages_text

