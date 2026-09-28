"""Resume file parsers — PDF, DOCX, TXT."""

import io


def parse_pdf(content: bytes) -> str:
    """Parse PDF using pdfminer.six (pure Python, no binary deps)."""
    try:
        from pdfminer.high_level import extract_text
        return extract_text(io.BytesIO(content))
    except ImportError:
        # Fallback: basic text extraction
        text = content.decode("utf-8", errors="ignore")
        return " ".join(text.split())


def parse_docx(content: bytes) -> str:
    """Parse DOCX using python-docx."""
    try:
        import docx
        doc = docx.Document(io.BytesIO(content))
        return "\n".join(p.text for p in doc.paragraphs if p.text.strip())
    except ImportError:
        return content.decode("utf-8", errors="ignore")


def parse_txt(content: bytes) -> str:
    return content.decode("utf-8", errors="ignore")
