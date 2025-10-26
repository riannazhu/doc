# 🚀 Quick Start Guide

**Goal:** Get your document processing backend running in 5 minutes.

## Prerequisites Check

```bash
# 1. Check Python version (need 3.11+)
python --version

# 2. Check if Tesseract is installed
tesseract --version

# If not installed:
# macOS: brew install tesseract
# Ubuntu: sudo apt-get install tesseract-ocr
```

## Setup (One Time)

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create virtual environment
python -m venv .venv

# 3. Activate it
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# 4. Install dependencies
pip install -r requirements.txt
```

## Database Setup (One Time)

**Option A: Via Supabase Dashboard**
1. Open: https://app.supabase.com/project/uwfeebxchoitwymaaqrh/sql
2. Copy entire contents of `backend/setup.sql`
3. Paste and click **Run**
4. Verify: Should see "Setup complete!"

**Option B: Via psql**
```bash
psql "postgresql://postgres:test123@db.uwfeebxchoitwymaaqrh.supabase.co:5432/postgres" \
  -f setup.sql
```

## Storage Setup (One Time)

1. Open: https://app.supabase.com/project/uwfeebxchoitwymaaqrh/storage
2. Click **New bucket**
3. Name: `private-user-docs`
4. Toggle **Private** (important!)
5. Click **Create bucket**

## Start Server (Every Time)

```bash
cd backend
./start.sh
```

Or manually:
```bash
source .venv/bin/activate
export $(grep -v '^#' ../.env | xargs)
uvicorn app.main:app --reload --port 8080
```

**Expected Output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8080
INFO:     Application startup complete.
```

## Test It Works

**Option 1: Browser**
- Open http://localhost:8080/docs
- Click `POST /upload_document` → Try it out
- Upload a test PDF

**Option 2: Python Script**
```bash
python test_upload.py ~/Downloads/sample.pdf test-user-123
```

**Option 3: curl**
```bash
curl -X POST "http://localhost:8080/upload_document" \
  -F "user_id=test-user-123" \
  -F "file=@/path/to/document.pdf"
```

## Wire to Frontend

**1. Create API client:** `src/lib/api-client.ts`
```typescript
const API_BASE = "http://localhost:8080";

export async function uploadDocument(file: File, userId: string) {
  const formData = new FormData();
  formData.append("user_id", userId);
  formData.append("file", file);
  
  const response = await fetch(`${API_BASE}/upload_document`, {
    method: "POST",
    body: formData,
  });
  
  if (!response.ok) throw new Error("Upload failed");
  return response.json(); // { document_id, status }
}
```

**2. Wire upload button:**
```typescript
const handleUpload = async (file: File) => {
  try {
    const result = await uploadDocument(file, userId);
    console.log("Success:", result.document_id);
  } catch (error) {
    console.error("Failed:", error);
  }
};
```

**3. Add to component:**
```tsx
<input 
  type="file" 
  accept="application/pdf"
  onChange={(e) => handleUpload(e.target.files[0])}
/>
```

## Common Issues

**"Tesseract not found"**
```bash
brew install tesseract  # macOS
# or
sudo apt-get install tesseract-ocr  # Ubuntu
```

**"Could not connect to database"**
- Check `.env` file exists in project root
- Verify `POSTGRES_CONNECTION_URL` is correct

**"Storage bucket not found"**
- Create bucket: https://app.supabase.com/project/uwfeebxchoitwymaaqrh/storage
- Name: `private-user-docs`
- Make it **Private**

**"Module not found"**
```bash
source .venv/bin/activate
pip install -r requirements.txt
```

## File Overview

| File | Purpose |
|------|---------|
| `app/main.py` | FastAPI app with 3 endpoints |
| `app/pipelines.py` | Document processing pipeline |
| `app/config.py` | Environment variables |
| `setup.sql` | Database schema |
| `start.sh` | Server startup script |
| `test_upload.py` | Test utility |

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/upload_document` | POST | Upload & process document |
| `/documents` | GET | List user's documents |
| `/documents/{id}/explain` | POST | Ask questions (RAG) |

## Environment Variables

Located in `../.env` (project root):

```env
OPENAI_API_KEY=sk-proj-...
SUPABASE_URL=https://uwfeebxchoitwymaaqrh.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJh...
POSTGRES_CONNECTION_URL=postgresql://...
SUPABASE_STORAGE_BUCKET=private-user-docs
```

## What Happens on Upload?

1. ✅ File uploaded to Supabase Storage
2. ✅ Text extracted from PDF (OCR if needed)
3. ✅ Embeddings generated (OpenAI)
4. ✅ Document classified (lease/bill/NDA)
5. ✅ Structured data extracted (amounts, dates)
6. ✅ Obligations created (payments, disputes)

Response: `{ document_id: "uuid", status: "processed" }`

## Next Steps

✅ Backend running  
➡️ Wire frontend upload button (see `INTEGRATION_GUIDE.md`)  
➡️ Test upload flow  
➡️ Build document library UI  
➡️ Implement Q&A interface  

## Need Help?

- **Full docs:** `backend/README.md`
- **Setup guide:** `backend/SETUP.md`
- **Integration:** `INTEGRATION_GUIDE.md`
- **Complete overview:** `COMPLETE.md`
- **API playground:** http://localhost:8080/docs

---

**Status: Ready to use! 🎉**

