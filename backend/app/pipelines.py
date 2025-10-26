import uuid
from typing import Tuple
from .supabase_client import get_supabase_client
from .config import settings
from .db import get_db
from .utils import extract_text_pages_from_pdf_bytes
from .embeddings import embed_text_list
from .extraction import extract_structured_fields

async def store_original_in_storage(user_id: str, document_id: str, file_bytes: bytes, file_name: str) -> str:
    supabase = get_supabase_client()
    storage_path = f"user_{user_id}/{document_id}/source.pdf"
    supabase.storage.from_(settings.supabase_storage_bucket).upload(
        path=storage_path,
        file=file_bytes,
        file_options={"content-type": "application/pdf", "upsert": "true"}
    )
    return storage_path

async def insert_document_row(user_id: str, file_name: str, storage_path: str) -> str:
    async with get_db() as (conn, cur):
        await cur.execute(
            """
            insert into document (user_id, file_name, storage_path, status)
            values (%s, %s, %s, 'received')
            returning document_id::text
            """,
            (user_id, file_name, storage_path)
        )
        row = await cur.fetchone()
        await conn.commit()
        return row[0]

async def persist_pages_and_embeddings(document_id: str, pages_text: list[str]) -> None:
    async with get_db() as (conn, cur):
        # insert pages
        for idx, text in enumerate(pages_text, start=1):
            await cur.execute(
                """insert into document_page (document_id, page_number, page_text)
                   values (%s, %s, %s)""",
                (document_id, idx, text)
            )
        # embeddings (per page)
        vectors = embed_text_list(pages_text)
        for idx, vec in enumerate(vectors, start=1):
            await cur.execute(
                """insert into document_embedding (document_id, page_number, embedding)
                   values (%s, %s, %s)""",
                (document_id, idx, vec)
            )
        await conn.commit()

async def detect_doc_type_heuristic(pages_text: list[str]) -> Tuple[str, float]:
    head = " ".join(pages_text[:2]).lower()
    if "lease" in head: return "lease", 0.8
    if "statement" in head or "amount due" in head: return "bill", 0.7
    if "nda" in head or "non-disclosure" in head: return "nda", 0.7
    return "unknown", 0.4

async def update_document_type_status(document_id: str, doc_type: str, status: str) -> None:
    async with get_db() as (conn, cur):
        await cur.execute(
            "update document set detected_doc_type=%s, status=%s where document_id=%s",
            (doc_type, status, document_id)
        )
        await conn.commit()

async def persist_extracted_facts(document_id: str, fx: dict) -> None:
    async with get_db() as (conn, cur):
        # Flatten fields to JSONB fact_value
        import json
        async def ins(ftype: str, fval, conf=None, page=None, quote=None):
            return await cur.execute(
                """insert into extracted_fact (document_id, fact_type, fact_value, confidence, source_page, source_quote)
                   values (%s, %s, %s, %s, %s, %s)""",
                (document_id, ftype, json.dumps(fval), conf, page, quote)
            )
        # amount_due_cents
        if fx.get("amount_due_cents") is not None:
            await ins("amount_due_cents", fx["amount_due_cents"])
        if fx.get("due_date_iso"):
            await ins("due_date_iso", fx["due_date_iso"])
        if fx.get("counterparty_name"):
            await ins("counterparty_name", fx["counterparty_name"])
        if "late_fee_rule" in fx:
            await ins("late_fee_rule", fx["late_fee_rule"])
        # citations
        for c in fx.get("citations", []):
            await ins(f"citation::{c.get('field','unknown')}", c)
        await conn.commit()

async def build_obligations_from_facts(document_id: str, fx: dict) -> None:
    amount = fx.get("amount_due_cents")
    due = fx.get("due_date_iso")
    counterparty = fx.get("counterparty_name")
    async with get_db() as (conn, cur):
        if amount is not None and due is not None:
            title = f"Pay {counterparty or 'counterparty'}"
            await cur.execute(
                """insert into obligation (document_id, obligation_type, title, due_date, amount_cents, counterparty_name, status, confidence)
                   values (%s, 'payment', %s, %s, %s, %s, 'open', 0.9)""",
                (document_id, title, due, amount, counterparty)
            )
        lfr = fx.get("late_fee_rule", {})
        if lfr and lfr.get("is_present"):
            await cur.execute(
                """insert into obligation (document_id, obligation_type, title, status, confidence, counterparty_name)
                   values (%s, 'dispute', 'Request late fee waiver', 'open', 0.7, %s)""",
                (document_id, counterparty)
            )
        await conn.commit()

async def ingest_document(user_id: str, file_bytes: bytes, file_name: str) -> str:
    # create document row first (storage_path is decided immediately for simplicity)
    document_id = str(uuid.uuid4())
    storage_path = f"user_{user_id}/{document_id}/source.pdf"

    # upload to storage
    supabase = get_supabase_client()
    supabase.storage.from_(settings.supabase_storage_bucket).upload(
        path=storage_path,
        file=file_bytes,
        file_options={"content-type": "application/pdf", "upsert": "true"}
    )

    # persist document row
    async with get_db() as (conn, cur):
        await cur.execute(
            """insert into document (document_id, user_id, file_name, storage_path, status)
               values (%s, %s, %s, %s, 'received')""",
            (document_id, user_id, file_name, storage_path)
        )
        await conn.commit()

    # extract pages + embeddings + facts + obligations
    pages_text = extract_text_pages_from_pdf_bytes(file_bytes)
    await persist_pages_and_embeddings(document_id, pages_text)
    doc_type, _ = await detect_doc_type_heuristic(pages_text)
    await update_document_type_status(document_id, doc_type, "extracting")

    facts = extract_structured_fields(pages_text)
    await persist_extracted_facts(document_id, facts)
    await build_obligations_from_facts(document_id, facts)
    await update_document_type_status(document_id, doc_type, "processed")

    return document_id

