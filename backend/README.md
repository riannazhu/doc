# Agentic Document Manager - Backend

FastAPI backend for intelligent document processing with OpenAI and Supabase.

## Features

- **Document Upload & Storage**: PDF/image uploads to Supabase Storage
- **Text Extraction**: pdfplumber + pytesseract OCR fallback
- **Structured Extraction**: OpenAI GPT-4o-mini extracts amounts, dates, counterparties
- **Vector Search**: pgvector embeddings for semantic Q&A
- **Action Detection**: Automatically creates obligations (payments, disputes)

## Stack

- **FastAPI** - Modern Python web framework
- **Supabase Storage** - Private document storage
- **Supabase Postgres + pgvector** - Vector similarity search
- **OpenAI** - Embeddings (text-embedding-3-small) + LLM (gpt-4o-mini)
- **pdfplumber + pytesseract** - PDF text extraction + OCR

## Setup

### 1. Prerequisites

Install Tesseract OCR:
```bash
# macOS
brew install tesseract

# Ubuntu/Debian
sudo apt-get install tesseract-ocr

# Windows
# Download from: https://github.com/UB-Mannheim/tesseract/wiki
```

### 2. Install Dependencies

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Configure Environment

Copy `.env.example` from project root to `.env` (already includes your credentials):

```bash
cp ../.env.example ../.env
```

Or create `.env` with:
```env
OPENAI_API_KEY=your_key_here
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
POSTGRES_CONNECTION_URL=your_postgres_url
SUPABASE_STORAGE_BUCKET=private-user-docs
FILE_CHUNK_PAGE_LIMIT=3
```

### 4. Supabase Database Setup

Go to your Supabase project → SQL Editor and run:

```sql
-- Enable pgvector extension
create extension if not exists vector;

-- Core tables
create table if not exists document (
  document_id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  file_name text not null,
  storage_path text not null,
  detected_doc_type text,
  status text not null default 'received',
  created_at timestamptz not null default now()
);

create table if not exists document_page (
  page_id uuid primary key default gen_random_uuid(),
  document_id uuid not null references document(document_id) on delete cascade,
  page_number int not null,
  page_text text not null
);

create table if not exists document_embedding (
  embedding_id uuid primary key default gen_random_uuid(),
  document_id uuid not null references document(document_id) on delete cascade,
  page_number int not null,
  embedding vector(1536) not null
);

create index if not exists document_embedding_ivf
  on document_embedding using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

create table if not exists extracted_fact (
  fact_id uuid primary key default gen_random_uuid(),
  document_id uuid not null references document(document_id) on delete cascade,
  fact_type text not null,
  fact_value jsonb not null,
  confidence numeric,
  source_page int,
  source_quote text
);

create table if not exists obligation (
  obligation_id uuid primary key default gen_random_uuid(),
  document_id uuid not null references document(document_id) on delete cascade,
  obligation_type text not null,
  title text not null,
  due_date date,
  amount_cents int,
  counterparty_name text,
  status text not null default 'open',
  confidence numeric
);
```

### 5. Create Storage Bucket

In Supabase Dashboard → Storage:
1. Create a new bucket named `private-user-docs`
2. Set it to **Private**
3. Backend uses service role key for server-side uploads

## Run

```bash
# From project root
cd backend
source .venv/bin/activate
export $(grep -v '^#' ../.env | xargs)
uvicorn app.main:app --reload --port 8080
```

API will be available at `http://localhost:8080`

Interactive docs: `http://localhost:8080/docs`

## API Endpoints

### `POST /upload_document`

Upload a PDF or image document.

**Request:**
- `user_id` (form field): User UUID
- `file` (file upload): PDF, PNG, or JPEG

**Response:**
```json
{
  "document_id": "uuid",
  "status": "processed"
}
```

**Processing Pipeline:**
1. Upload to Supabase Storage
2. Extract text from pages (OCR if needed)
3. Generate embeddings for each page
4. Detect document type (heuristic)
5. Extract structured fields (OpenAI)
6. Create obligations (payments, disputes)

### `GET /documents`

List all documents for a user.

**Query Params:**
- `user_id`: User UUID

**Response:**
```json
[
  {
    "document_id": "uuid",
    "file_name": "lease.pdf",
    "detected_doc_type": "lease",
    "status": "processed"
  }
]
```

### `POST /documents/{document_id}/explain`

Ask questions about a document using RAG.

**Request:**
- `question_text` (form field): Natural language question

**Response:**
```json
{
  "answer_text": "Your lease starts on January 1, 2025...",
  "citations": [
    {"page": 1},
    {"page": 2}
  ]
}
```

## Architecture

### Document Processing Flow

```
Upload → Storage → Text Extraction → Embeddings → Structured Extraction → Obligations
```

1. **Storage** (`pipelines.py:ingest_document`)
   - Upload to Supabase Storage at `user_{user_id}/{document_id}/source.pdf`

2. **Text Extraction** (`utils.py:extract_text_pages_from_pdf_bytes`)
   - pdfplumber for text extraction
   - pytesseract OCR fallback for scanned documents

3. **Embeddings** (`embeddings.py:embed_text_list`)
   - OpenAI `text-embedding-3-small` (1536 dims)
   - One embedding per page

4. **Structured Extraction** (`extraction.py:extract_structured_fields`)
   - GPT-4o-mini extracts: amounts, dates, counterparties, late fees
   - Returns JSON with citations

5. **Obligations** (`pipelines.py:build_obligations_from_facts`)
   - Creates action items: payments, disputes
   - Stored in `obligation` table

### Vector Search

Q&A uses pgvector cosine similarity:

```sql
SELECT page_text 
FROM document_embedding
WHERE document_id = ?
ORDER BY embedding <#> question_embedding
LIMIT 3
```

## Security Notes

- Backend uses **service role key** (server-side only)
- Storage bucket is **private**
- Don't expose service role key to frontend
- Add rate limiting for production
- Validate file sizes and types

## Frontend Integration

```typescript
// Upload document
async function uploadDocument(file: File, userId: string) {
  const formData = new FormData();
  formData.append("user_id", userId);
  formData.append("file", file);
  
  const res = await fetch("http://localhost:8080/upload_document", {
    method: "POST",
    body: formData
  });
  
  return res.json(); // { document_id, status }
}

// Ask question
async function askDocument(documentId: string, question: string) {
  const formData = new FormData();
  formData.append("question_text", question);
  
  const res = await fetch(`http://localhost:8080/documents/${documentId}/explain`, {
    method: "POST",
    body: formData
  });
  
  return res.json(); // { answer_text, citations }
}
```

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app & endpoints
│   ├── config.py            # Environment config
│   ├── db.py                # Postgres connection
│   ├── supabase_client.py   # Supabase Storage client
│   ├── pipelines.py         # Document ingestion pipeline
│   ├── extraction.py        # OpenAI structured extraction
│   ├── embeddings.py        # OpenAI embeddings
│   ├── schemas.py           # Pydantic models
│   ├── utils.py             # PDF/OCR utilities
│   └── models_sql.py        # SQL schema reference
└── requirements.txt
```

## Troubleshooting

**Tesseract not found:**
```bash
# macOS
brew install tesseract

# Ubuntu
sudo apt-get install tesseract-ocr
```

**Postgres connection fails:**
- Check `POSTGRES_CONNECTION_URL` format
- Ensure Supabase project is active
- Verify network access

**Storage upload fails:**
- Check `SUPABASE_SERVICE_ROLE_KEY` is correct
- Ensure bucket `private-user-docs` exists and is private
- Verify storage path doesn't have illegal characters

**Vector search returns no results:**
- Ensure pgvector extension is enabled: `create extension vector;`
- Check embeddings were created: `select count(*) from document_embedding;`
- Verify index exists: `\d document_embedding` in psql

## Next Steps

- [ ] Add image support (convert images to PDF first)
- [ ] Implement chunking for large documents
- [ ] Add async task queue (Celery/Redis) for long processing
- [ ] Add webhook notifications when processing completes
- [ ] Implement user authentication & authorization
- [ ] Add document versioning
- [ ] Create admin dashboard for monitoring

