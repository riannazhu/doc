from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .schemas import UploadResponse, DocumentSummary, ExplainResponse
from .pipelines import ingest_document
from .db import get_db
from .config import settings
from .embeddings import embed_text_list
from openai import OpenAI

app = FastAPI(title="Agentic Doc Manager API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten for prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload_document", response_model=UploadResponse)
async def upload_document(user_id: str = Form(...), file: UploadFile = File(...)):
    if file.content_type not in ("application/pdf", "image/png", "image/jpeg"):
        raise HTTPException(status_code=400, detail="Unsupported file type")
    file_bytes = await file.read()
    document_id = await ingest_document(user_id=user_id, file_bytes=file_bytes, file_name=file.filename)
    return UploadResponse(document_id=document_id, status="processed")

@app.get("/documents", response_model=list[DocumentSummary])
async def list_documents(user_id: str):
    async with get_db() as (conn, cur):
        await cur.execute(
            """select document_id::text, file_name, detected_doc_type, status
               from document where user_id=%s
               order by created_at desc""",
            (user_id,)
        )
        rows = await cur.fetchall()
    return [
        DocumentSummary(
            document_id=r[0],
            file_name=r[1],
            detected_doc_type=r[2],
            status=r[3],
        ) for r in rows
    ]

@app.post("/documents/{document_id}/explain", response_model=ExplainResponse)
async def explain_document(document_id: str, question_text: str = Form(...)):
    # Retrieve top pages by cosine distance using pgvector
    async with get_db() as (conn, cur):
        # Embed the question
        question_vec = embed_text_list([question_text])[0]
        # SQL query: find top 3 pages for this document
        await cur.execute(
            """
            select dp.page_number, dp.page_text,
                   (de.embedding <#> %s) as cosine_distance
            from document_embedding de
            join document_page dp using (document_id, page_number)
            where de.document_id = %s
            order by de.embedding <#> %s
            limit 3
            """,
            (question_vec, document_id, question_vec)
        )
        rows = await cur.fetchall()

    retrieved = [{"page_number": r[0], "page_text": r[1], "score": float(r[2])} for r in rows]
    snippets = "\n\n".join([f"[page {r['page_number']}] {r['page_text'][:1200]}" for r in retrieved])

    client = OpenAI(api_key=settings.openai_api_key)
    prompt = f"""Answer the user question using ONLY the provided snippets. 
If unknown, say you cannot find it in this document.
Include 1–2 short citations with page numbers.

Question: "{question_text}"

Snippets:
{snippets}
"""
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role":"system","content":"You answer questions strictly from provided context."},
            {"role":"user","content": prompt}
        ],
        temperature=0.0
    )
    answer_text = resp.choices[0].message.content.strip()
    # naive citation extraction for demo: use page tags present in answer
    citations = [{"page": r["page_number"]} for r in retrieved[:2]]

    return ExplainResponse(answer_text=answer_text, citations=citations)

