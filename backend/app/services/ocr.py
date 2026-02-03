import fitz  # PyMuPDF

def extract_text_from_pdf(file_content: bytes) -> str:
    """Extrae texto plano de un archivo PDF en bytes."""
    doc = fitz.open(stream=file_content, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    return text