# Backend Setup Guide

Complete step-by-step guide to get the Agentic Document Manager backend running.

## Prerequisites

- Python 3.11+
- Tesseract OCR
- Supabase account
- OpenAI API key

## Quick Start (5 minutes)

### 1. Install Tesseract OCR

**macOS:**
```bash
brew install tesseract
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install tesseract-ocr
```

**Windows:**
Download from: https://github.com/UB-Mannheim/tesseract/wiki

### 2. Setup Python Environment

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Configure Environment

The `.env.example` file in the project root already contains your credentials. Just verify it exists:

```bash
# Check if .env.example exists in project root
ls -la ../.env.example
```

If you need to create a new `.env` file:

```bash
# Option 1: Copy from example
cp ../.env.example ../.env

# Option 2: Create manually
cat > ../.env << 'EOF'
OPENAI_API_KEY=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
SUPABASE_URL=https://uwfeebxchoitwymaaqrh.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3ZmVlYnhjaG9pdHd5bWFhcXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTQxOTIyMCwiZXhwIjoyMDc2OTk1MjIwfQ.pMTp2xfBhHP0-TlirsNzpAI2A5sjp-8UBMu6F3G_5l4
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3ZmVlYnhjaG9pdHd5bWFhcXJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MTkyMjAsImV4cCI6MjA3Njk5NTIyMH0.1NgoUguPY5XLQYSClhGUVyIrStPG0TUNNS5DqcrDse8
POSTGRES_CONNECTION_URL=postgresql://postgres:test123@db.uwfeebxchoitwymaaqrh.supabase.co:5432/postgres
SUPABASE_STORAGE_BUCKET=private-user-docs
FILE_CHUNK_PAGE_LIMIT=3
EOF
```

### 4. Setup Supabase Database

1. Go to your Supabase project: https://app.supabase.com/project/uwfeebxchoitwymaaqrh
2. Navigate to **SQL Editor** (left sidebar)
3. Copy the entire contents of `backend/setup.sql`
4. Paste into SQL Editor and click **Run**

You should see: "Setup complete! Tables created:" with a list of tables.

### 5. Create Storage Bucket

1. In Supabase Dashboard, go to **Storage** (left sidebar)
2. Click **New bucket**
3. Name: `private-user-docs`
4. Make it **Private** (toggle off "Public bucket")
5. Click **Create bucket**

### 6. Start the Server

**Option A: Using the start script (recommended)**
```bash
./start.sh
```

**Option B: Manual start**
```bash
source .venv/bin/activate
export $(grep -v '^#' ../.env | xargs)
uvicorn app.main:app --reload --port 8080
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8080
INFO:     Application startup complete.
```

### 7. Test the API

Open your browser to http://localhost:8080/docs to see the interactive API documentation.

Or test with the included script:
```bash
# Download a sample PDF first
python test_upload.py /path/to/your/document.pdf
```

## Verification Checklist

- [ ] Tesseract installed: `tesseract --version`
- [ ] Python environment created and activated
- [ ] All dependencies installed: `pip list | grep fastapi`
- [ ] `.env` file exists in project root with all keys
- [ ] Supabase tables created (check SQL Editor output)
- [ ] Storage bucket `private-user-docs` exists and is private
- [ ] Server starts without errors
- [ ] API docs accessible at http://localhost:8080/docs

## Testing

### 1. Test with curl

```bash
# Upload a document
curl -X POST "http://localhost:8080/upload_document" \
  -F "user_id=test-user-123" \
  -F "file=@/path/to/document.pdf"

# List documents
curl "http://localhost:8080/documents?user_id=test-user-123"

# Ask a question (replace DOCUMENT_ID)
curl -X POST "http://localhost:8080/documents/DOCUMENT_ID/explain" \
  -F "question_text=What is the due date?"
```

### 2. Test with Python script

```bash
python test_upload.py ~/Downloads/invoice.pdf test-user-123
```

### 3. Test with API docs

1. Go to http://localhost:8080/docs
2. Click on `POST /upload_document`
3. Click **Try it out**
4. Fill in `user_id` and choose a file
5. Click **Execute**

## Common Issues

### "Tesseract not found"

**Solution:**
```bash
# macOS
brew install tesseract

# Ubuntu
sudo apt-get install tesseract-ocr

# Verify
tesseract --version
```

### "Could not connect to database"

**Solution:**
1. Check `POSTGRES_CONNECTION_URL` in `.env`
2. Verify Supabase project is active
3. Test connection:
```bash
psql "postgresql://postgres:test123@db.uwfeebxchoitwymaaqrh.supabase.co:5432/postgres"
```

### "Storage bucket not found"

**Solution:**
1. Go to Supabase → Storage
2. Create bucket named `private-user-docs`
3. Make it **Private**
4. Verify `SUPABASE_STORAGE_BUCKET=private-user-docs` in `.env`

### "Module not found" errors

**Solution:**
```bash
# Make sure virtual environment is activated
source .venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

### "OpenAI API key invalid"

**Solution:**
1. Check `OPENAI_API_KEY` in `.env`
2. Verify key is active in OpenAI dashboard
3. Ensure no extra spaces or quotes

### Vector search returns no results

**Solution:**
1. Verify pgvector extension is enabled:
```sql
SELECT * FROM pg_extension WHERE extname = 'vector';
```

2. Check embeddings were created:
```sql
SELECT count(*) FROM document_embedding;
```

3. Recreate index if needed:
```sql
DROP INDEX IF EXISTS document_embedding_ivf;
CREATE INDEX document_embedding_ivf 
  ON document_embedding USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
```

## Architecture Overview

```
┌─────────────┐
│   Frontend  │
│  (React)    │
└──────┬──────┘
       │ HTTP/multipart
       ▼
┌─────────────────────────────────────────┐
│         FastAPI Backend                 │
│  ┌────────────────────────────────┐    │
│  │ POST /upload_document          │    │
│  │  ├─ Upload to Supabase Storage │    │
│  │  ├─ Extract text (pdfplumber)  │    │
│  │  ├─ Generate embeddings (OpenAI)   │
│  │  ├─ Structured extraction (GPT)    │
│  │  └─ Create obligations          │    │
│  ├────────────────────────────────┤    │
│  │ GET /documents                  │    │
│  ├────────────────────────────────┤    │
│  │ POST /documents/{id}/explain    │    │
│  │  ├─ Vector search (pgvector)    │    │
│  │  └─ LLM answer (GPT-4o-mini)    │    │
│  └────────────────────────────────┘    │
└─────────┬────────────────┬──────────────┘
          │                │
          ▼                ▼
   ┌────────────┐   ┌──────────────┐
   │  Supabase  │   │   OpenAI     │
   │  Storage   │   │  - Embeddings│
   │  Postgres  │   │  - GPT-4o    │
   │  pgvector  │   └──────────────┘
   └────────────┘
```

## Next Steps

1. **Frontend Integration**: Wire the Upload button in your React app
2. **Authentication**: Add user authentication
3. **File Validation**: Add size limits and type checks
4. **Error Handling**: Improve error messages
5. **Monitoring**: Add logging and metrics
6. **Deployment**: Deploy to production (Railway, Fly.io, etc.)

## API Quick Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/upload_document` | POST | Upload and process document |
| `/documents` | GET | List user's documents |
| `/documents/{id}/explain` | POST | Ask questions about document |

See `README.md` for detailed API documentation.

## Support

- Backend code: `backend/app/`
- SQL schema: `backend/setup.sql`
- API docs: http://localhost:8080/docs
- Supabase Dashboard: https://app.supabase.com

## Development Tips

**Hot Reload:**
The server runs with `--reload` flag, so code changes auto-restart the server.

**Debugging:**
Add `import pdb; pdb.set_trace()` anywhere in the code to debug.

**View Logs:**
Server logs show in terminal. Add print statements for quick debugging.

**Database Inspection:**
```bash
# Connect to Supabase Postgres
psql "postgresql://postgres:test123@db.uwfeebxchoitwymaaqrh.supabase.co:5432/postgres"

# List tables
\dt

# View documents
SELECT * FROM document LIMIT 5;

# Check embeddings
SELECT count(*), document_id FROM document_embedding GROUP BY document_id;
```

**Storage Inspection:**
Go to Supabase Dashboard → Storage → `private-user-docs` to browse uploaded files.

