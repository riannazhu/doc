from pydantic import BaseModel
from typing import Optional, List, Any

class UploadResponse(BaseModel):
    document_id: str
    status: str

class DocumentSummary(BaseModel):
    document_id: str
    file_name: str
    detected_doc_type: Optional[str] = None
    status: str

class RetrievedPage(BaseModel):
    page_number: int
    page_text: str
    score: float

class ExplainResponse(BaseModel):
    answer_text: str
    citations: list[dict]

