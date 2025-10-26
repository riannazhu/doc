# 🧪 Complete Testing Instructions

## Status Check

✅ **Tesseract installed** - You already have this! (macOS users don't need `apt-get`)

Now let's test everything end-to-end.

---

## Part 1: Setup Backend (3 minutes)

### Step 1: Setup Python Environment

```bash
cd /Users/dennisvengerov/Desktop/Projects/doc/backend

# Create virtual environment
python -m venv .venv

# Activate it
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Expected output: Should see packages installing without errors.

### Step 2: Initialize Supabase Database

**Option A: Via Supabase Dashboard** (Recommended)

1. Open this URL: https://app.supabase.com/project/uwfeebxchoitwymaaqrh/sql

2. Copy the ENTIRE contents of this file: `backend/setup.sql`
   ```bash
   cat backend/setup.sql
   ```

3. Paste into the SQL Editor

4. Click **RUN** (big green button)

5. Verify output says: "Setup complete! Tables created:"

**Option B: Via Command Line**

```bash
psql "postgresql://postgres:test123@db.uwfeebxchoitwymaaqrh.supabase.co:5432/postgres" \
  -f setup.sql
```

### Step 3: Create Storage Bucket

1. Open: https://app.supabase.com/project/uwfeebxchoitwymaaqrh/storage

2. Click **"New bucket"** button

3. Fill in:
   - Name: `private-user-docs`
   - **Toggle OFF** "Public bucket" (keep it Private!)

4. Click **"Create bucket"**

5. Verify you see `private-user-docs` in the list

### Step 4: Start Backend Server

```bash
cd /Users/dennisvengerov/Desktop/Projects/doc/backend

# Make sure virtual environment is activated
source .venv/bin/activate

# Start server
./start.sh
```

**Expected Output:**
```
✅ Starting Agentic Document Manager Backend
✅ Activating virtual environment...
✅ Loading environment variables...
✅ Starting server on http://localhost:8080
✅ API docs available at http://localhost:8080/docs
INFO:     Uvicorn running on http://127.0.0.1:8080
INFO:     Application startup complete.
```

**Keep this terminal open!** The server needs to keep running.

### Step 5: Verify Backend is Running

Open a **NEW terminal** and test:

```bash
# Test 1: Health check
curl http://localhost:8080/docs

# Test 2: List documents (should return empty array)
curl "http://localhost:8080/documents?user_id=test-user-123"
```

Expected: Should return `[]` (empty array)

---

## Part 2: Setup Frontend (2 minutes)

### Step 1: Install Frontend Dependencies (if needed)

```bash
cd /Users/dennisvengerov/Desktop/Projects/doc

# Install dependencies (if you haven't already)
npm install
```

### Step 2: Start Frontend

```bash
npm run dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Keep this terminal open too!**

---

## Part 3: End-to-End Testing (5 minutes)

### Test 1: Access the Application

1. **Open browser**: http://localhost:5173

2. **Navigate to Dashboard**: Click "Get Started" or go directly to Dashboard

3. **Verify UI**: You should see:
   - Left sidebar with "Your Documents"
   - "Upload Document" button
   - "No documents yet" message
   - Chat interface on the right

### Test 2: Upload a Document

**Need a test PDF?**
```bash
# Option 1: Find a PDF on your computer
# Look in ~/Downloads/ for any PDF

# Option 2: Create a simple test PDF
echo "Test Invoice - Amount Due: $150.00 - Due Date: 2025-02-15 - From: ACME Corp" | \
  textutil -stdin -output ~/Downloads/test-invoice.txt -format txt
# (Then manually save as PDF, or use any existing PDF)
```

**Upload steps:**

1. Click **"Upload Document"** button

2. Select a PDF file (any PDF works - invoice, receipt, lease, etc.)

3. Watch for:
   - ✅ Upload progress indicator
   - ✅ Success toast notification
   - ✅ Document appears in left sidebar
   - ✅ Document shows status badge

**Expected Result:**
- Document appears in list
- Status shows "processed"
- Type shows "bill" / "lease" / "nda" / "unknown"

**Backend terminal should show:**
```
INFO:     127.0.0.1:xxxxx - "POST /upload_document HTTP/1.1" 200 OK
```

### Test 3: Verify in Supabase

**Storage:**
1. Go to: https://app.supabase.com/project/uwfeebxchoitwymaaqrh/storage
2. Open `private-user-docs` bucket
3. You should see: `user_test-user-123/{document-id}/source.pdf`

**Database:**
1. Go to: https://app.supabase.com/project/uwfeebxchoitwymaaqrh/editor
2. Click "SQL Editor"
3. Run this query:

```sql
-- Check documents
SELECT * FROM document ORDER BY created_at DESC LIMIT 5;

-- Check pages
SELECT document_id, count(*) as page_count 
FROM document_page 
GROUP BY document_id;

-- Check embeddings
SELECT document_id, count(*) as embedding_count 
FROM document_embedding 
GROUP BY document_id;

-- Check extracted facts
SELECT document_id, fact_type, fact_value 
FROM extracted_fact 
ORDER BY document_id;

-- Check obligations
SELECT * FROM obligation ORDER BY created_at DESC;
```

You should see data in all tables!

### Test 4: Ask Questions About Document

1. **Select document**: Click on the document in the left sidebar

2. **Ask a question** in the chat input:
   - "What is this document about?"
   - "What is the due date?"
   - "Who is this from?"
   - "Summarize the key points"

3. **Watch for:**
   - ✅ Your question appears in chat
   - ✅ Response appears below (may take 2-5 seconds)
   - ✅ Answer references specific pages

**Expected Result:**
- Answer appears in chat
- Answer is relevant to document content
- May include page citations

**Backend terminal should show:**
```
INFO:     127.0.0.1:xxxxx - "POST /documents/{id}/explain HTTP/1.1" 200 OK
```

### Test 5: Upload Multiple Documents

1. Upload 2-3 more documents

2. **Verify:**
   - All appear in left sidebar
   - Each shows correct status
   - Each can be selected
   - Questions work for each document

---

## Part 4: Verify Full Pipeline

Let's verify each step of the pipeline worked:

### Check 1: File Storage

```bash
# View all uploaded files in Supabase Storage
# Go to: https://app.supabase.com/project/uwfeebxchoitwymaaqrh/storage/buckets/private-user-docs
```

You should see folder structure: `user_test-user-123/{doc-id}/source.pdf`

### Check 2: Database Content

Run in Supabase SQL Editor:

```sql
-- Full pipeline check
WITH doc_stats AS (
  SELECT 
    d.document_id,
    d.file_name,
    d.detected_doc_type,
    d.status,
    COUNT(DISTINCT dp.page_id) as page_count,
    COUNT(DISTINCT de.embedding_id) as embedding_count,
    COUNT(DISTINCT ef.fact_id) as fact_count,
    COUNT(DISTINCT o.obligation_id) as obligation_count
  FROM document d
  LEFT JOIN document_page dp ON d.document_id = dp.document_id
  LEFT JOIN document_embedding de ON d.document_id = de.document_id
  LEFT JOIN extracted_fact ef ON d.document_id = ef.document_id
  LEFT JOIN obligation o ON d.document_id = o.document_id
  WHERE d.user_id = 'test-user-123'
  GROUP BY d.document_id, d.file_name, d.detected_doc_type, d.status
)
SELECT * FROM doc_stats;
```

**Expected Output:**
- Each document has: pages, embeddings, facts, and possibly obligations
- Status is "processed"
- Type is detected (or "unknown")

### Check 3: Vector Search

Test semantic search directly:

```sql
-- This tests if embeddings work (you'll need an actual embedding vector)
SELECT 
  dp.page_number,
  dp.page_text,
  dp.document_id
FROM document_page dp
WHERE dp.document_id IN (
  SELECT document_id FROM document WHERE user_id = 'test-user-123'
)
LIMIT 3;
```

---

## Part 5: Advanced Testing

### Test API Directly with curl

```bash
# Upload a document
curl -X POST "http://localhost:8080/upload_document" \
  -F "user_id=test-user-123" \
  -F "file=@/path/to/your/document.pdf"

# List documents
curl "http://localhost:8080/documents?user_id=test-user-123"

# Ask a question (replace DOCUMENT_ID with actual ID)
curl -X POST "http://localhost:8080/documents/DOCUMENT_ID/explain" \
  -F "question_text=What is the due date?"
```

### Test with Python Script

```bash
cd backend
python test_upload.py ~/Downloads/test.pdf test-user-123
```

Expected output:
```
📤 Uploading document: test.pdf
👤 User ID: test-user-123
✅ Success!
   Document ID: abc-123-def-456
   Status: processed

📋 Listing documents for user...
   Found 1 document(s)
   - test.pdf (processed)
```

### Test API Documentation UI

1. Open: http://localhost:8080/docs

2. Try each endpoint interactively:
   - `POST /upload_document` - Click "Try it out"
   - `GET /documents` - Click "Try it out"
   - `POST /documents/{id}/explain` - Click "Try it out"

---

## Troubleshooting

### Backend Issues

**"Module not found"**
```bash
cd backend
source .venv/bin/activate
pip install -r requirements.txt
```

**"Connection refused"**
- Make sure backend is running: `./start.sh`
- Check: http://localhost:8080/docs

**"Database connection failed"**
```bash
# Test connection
psql "postgresql://postgres:test123@db.uwfeebxchoitwymaaqrh.supabase.co:5432/postgres"

# Verify .env exists
cat ../.env | grep POSTGRES
```

**"Storage bucket not found"**
- Verify bucket exists: https://app.supabase.com/project/uwfeebxchoitwymaaqrh/storage
- Bucket name: `private-user-docs`
- Must be **Private**

### Frontend Issues

**"Cannot connect to backend"**
- Verify `.env.local` exists with: `VITE_API_BASE_URL=http://localhost:8080`
- Restart frontend: `npm run dev`
- Check browser console for CORS errors

**"Upload button doesn't work"**
- Check browser console (F12) for errors
- Verify backend is running
- Check file type (must be PDF, PNG, or JPEG)

**"No response to questions"**
- Make sure you selected a document first
- Check backend terminal for errors
- Verify OpenAI API key in `.env`

### OpenAI Issues

**"API key invalid"**
```bash
# Check key
cat ../.env | grep OPENAI

# Test key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_KEY_HERE"
```

**"Rate limit exceeded"**
- Wait a few seconds
- Check OpenAI dashboard for rate limits

---

## Success Checklist

- [ ] ✅ Tesseract installed
- [ ] Backend virtual environment created
- [ ] Backend dependencies installed
- [ ] Supabase database initialized (5 tables)
- [ ] Supabase storage bucket created (private-user-docs)
- [ ] Backend server running (http://localhost:8080)
- [ ] Frontend server running (http://localhost:5173)
- [ ] Can access frontend Dashboard
- [ ] Upload button works
- [ ] Document appears in list
- [ ] Document visible in Supabase Storage
- [ ] Database tables populated
- [ ] Can select document
- [ ] Can ask questions
- [ ] Answers appear with citations
- [ ] Multiple documents work

---

## What to Test

### Functional Tests

1. **Upload Flow**
   - ✅ File picker opens
   - ✅ Invalid file types rejected
   - ✅ Large files rejected (>10MB)
   - ✅ Progress indicator shows
   - ✅ Success notification appears
   - ✅ Document appears in list

2. **Document List**
   - ✅ Shows all user documents
   - ✅ Shows correct status
   - ✅ Shows detected type
   - ✅ Clicking selects document
   - ✅ Refreshes after upload

3. **Q&A Interface**
   - ✅ Requires document selection
   - ✅ Accepts questions
   - ✅ Returns relevant answers
   - ✅ Shows loading state
   - ✅ Handles errors gracefully

4. **Backend Processing**
   - ✅ Uploads to storage
   - ✅ Extracts text
   - ✅ Generates embeddings
   - ✅ Classifies document
   - ✅ Extracts structured data
   - ✅ Creates obligations

### Edge Cases

- Upload same file twice
- Upload very small PDF (1 page)
- Upload scanned document (OCR test)
- Ask question before selecting document
- Ask nonsensical question
- Upload while another is processing

---

## Performance Expectations

| Operation | Expected Time |
|-----------|--------------|
| Upload (small PDF) | 5-10 seconds |
| Upload (large PDF) | 10-20 seconds |
| Ask question | 2-5 seconds |
| List documents | < 1 second |

---

## Demo Script

Use this to demo the system:

1. **Open Dashboard**: "Here's our document processing system"

2. **Upload Document**: "Let's upload an invoice" (upload PDF)

3. **Show Processing**: "Watch as it processes... extracting text, generating embeddings, detecting type"

4. **Show Result**: "Document is now processed and classified"

5. **Select Document**: "Click to select it"

6. **Ask Question**: "What is the due date?"

7. **Show Answer**: "AI answers with page citations"

8. **Show Supabase**: "All data is stored in Supabase - storage, database, vectors"

9. **Show Backend**: "Backend handles the entire pipeline automatically"

---

## Next Steps After Testing

1. **Add Authentication**
   - Replace `test-user-123` with real user IDs
   - Integrate Supabase Auth

2. **Improve UI**
   - Add document thumbnails
   - Show extracted facts
   - Display obligations/action items

3. **Add Features**
   - Bulk upload
   - Document search
   - Export/download
   - Sharing

4. **Deploy**
   - Backend to Railway/Fly.io
   - Frontend to Vercel/Netlify
   - Update environment variables

---

## 🎉 You're Done!

If all tests pass, you have a working end-to-end document processing system!

**What works:**
- ✅ Upload PDFs/images
- ✅ Automatic text extraction (OCR included)
- ✅ Semantic embeddings for search
- ✅ Document classification
- ✅ Structured data extraction
- ✅ Q&A with citations
- ✅ Full database integration

**Ready for:**
- MVP testing
- User feedback
- Feature development
- Production deployment

Need help? Check:
- `backend/README.md` - Full API docs
- `backend/SETUP.md` - Setup troubleshooting
- `INTEGRATION_GUIDE.md` - Integration details
- Backend logs - Terminal running uvicorn
- Browser console - F12 developer tools

