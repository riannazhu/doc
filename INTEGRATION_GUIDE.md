# Frontend-Backend Integration Guide

Quick guide to wire your React frontend to the new FastAPI backend.

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                        Frontend (React)                       │
│                                                               │
│  src/pages/Dashboard.tsx                                     │
│    ↓                                                          │
│  src/components/dashboard/ChatInterface.tsx                  │
│    │                                                          │
│    ├─ Upload Button  ──────────────┐                         │
│    └─ Document List                │                         │
│                                     │                         │
└─────────────────────────────────────┼─────────────────────────┘
                                      │
                         HTTP POST    │ multipart/form-data
                                      ▼
┌──────────────────────────────────────────────────────────────┐
│                   Backend (FastAPI)                          │
│                   http://localhost:8080                      │
│                                                               │
│  POST /upload_document                                       │
│    ├─ Validate file type (PDF, PNG, JPEG)                   │
│    ├─ Upload to Supabase Storage                            │
│    ├─ Extract text (pdfplumber + OCR)                       │
│    ├─ Generate embeddings (OpenAI)                          │
│    ├─ Extract structured fields (GPT-4o-mini)               │
│    └─ Create obligations                                     │
│                                                               │
│  GET /documents?user_id=xxx                                  │
│    └─ List all documents for user                            │
│                                                               │
│  POST /documents/{id}/explain                                │
│    ├─ Vector search top pages                                │
│    └─ GPT-4o-mini generates answer                           │
│                                                               │
└──────────────────────────────────────────────────────────────┘
                      │                      │
                      ▼                      ▼
        ┌─────────────────────┐  ┌──────────────────┐
        │     Supabase        │  │     OpenAI       │
        │  Storage + Postgres │  │   Embeddings     │
        │     + pgvector      │  │   + GPT-4o       │
        └─────────────────────┘  └──────────────────┘
```

## Step 1: Create API Client

Create a new file for backend communication:

**File:** `src/lib/api-client.ts`

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export interface UploadResponse {
  document_id: string;
  status: string;
}

export interface DocumentSummary {
  document_id: string;
  file_name: string;
  detected_doc_type: string | null;
  status: string;
}

export interface ExplainResponse {
  answer_text: string;
  citations: Array<{ page: number }>;
}

/**
 * Upload a document for processing
 */
export async function uploadDocument(
  file: File,
  userId: string
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("user_id", userId);
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/upload_document`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Upload failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * List all documents for a user
 */
export async function listDocuments(userId: string): Promise<DocumentSummary[]> {
  const response = await fetch(
    `${API_BASE_URL}/documents?user_id=${encodeURIComponent(userId)}`
  );

  if (!response.ok) {
    throw new Error(`Failed to list documents: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Ask a question about a document
 */
export async function askDocument(
  documentId: string,
  question: string
): Promise<ExplainResponse> {
  const formData = new FormData();
  formData.append("question_text", question);

  const response = await fetch(
    `${API_BASE_URL}/documents/${documentId}/explain`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Question failed: ${response.statusText}`);
  }

  return response.json();
}
```

## Step 2: Add Environment Variable

**File:** Create or update `.env` in project root:

```env
VITE_API_BASE_URL=http://localhost:8080
```

For production:
```env
VITE_API_BASE_URL=https://your-backend.fly.dev
```

## Step 3: Wire Upload Button

Update your ChatInterface or create a new UploadButton component:

**File:** `src/components/dashboard/UploadButton.tsx`

```typescript
import { useState } from "react";
import { uploadDocument } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UploadButtonProps {
  userId: string;
  onUploadComplete?: (documentId: string) => void;
}

export function UploadButton({ userId, onUploadComplete }: UploadButtonProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["application/pdf", "image/png", "image/jpeg"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, PNG, or JPEG file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (e.g., 10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const result = await uploadDocument(file, userId);
      
      toast({
        title: "Upload successful!",
        description: `${file.name} has been processed.`,
      });

      // Callback for parent component
      onUploadComplete?.(result.document_id);

      // Reset input
      e.target.value = "";
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <label className="cursor-pointer">
      <input
        type="file"
        accept="application/pdf,image/png,image/jpeg"
        onChange={handleFileChange}
        disabled={uploading}
        className="hidden"
      />
      <Button disabled={uploading} asChild>
        <span>
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </>
          )}
        </span>
      </Button>
    </label>
  );
}
```

## Step 4: Integrate into Dashboard

Update your Dashboard or ChatInterface:

**File:** `src/components/dashboard/ChatInterface.tsx`

```typescript
import { UploadButton } from "./UploadButton";
import { listDocuments, askDocument } from "@/lib/api-client";
import { useState, useEffect } from "react";

export function ChatInterface() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // TODO: Get actual user ID from auth context
  const userId = "test-user-123"; // Replace with actual auth

  // Load documents on mount
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const docs = await listDocuments(userId);
      setDocuments(docs);
    } catch (error) {
      console.error("Failed to load documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = (documentId: string) => {
    console.log("Document uploaded:", documentId);
    // Refresh document list
    loadDocuments();
  };

  const handleAskQuestion = async (documentId: string, question: string) => {
    try {
      const response = await askDocument(documentId, question);
      console.log("Answer:", response.answer_text);
      console.log("Citations:", response.citations);
      // Display in your UI
    } catch (error) {
      console.error("Failed to ask question:", error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with Upload Button */}
      <div className="p-4 border-b flex justify-between items-center">
        <h2>Documents</h2>
        <UploadButton 
          userId={userId} 
          onUploadComplete={handleUploadComplete}
        />
      </div>

      {/* Document List */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <p>Loading documents...</p>
        ) : documents.length === 0 ? (
          <p>No documents yet. Upload one to get started!</p>
        ) : (
          <ul className="space-y-2">
            {documents.map((doc) => (
              <li key={doc.document_id} className="p-3 border rounded">
                <div className="font-medium">{doc.file_name}</div>
                <div className="text-sm text-gray-500">
                  Type: {doc.detected_doc_type || "Unknown"} • 
                  Status: {doc.status}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
```

## Step 5: Test Integration

### 1. Start Backend
```bash
cd backend
./start.sh
```

Backend should be running at http://localhost:8080

### 2. Start Frontend
```bash
cd ..
npm run dev
```

Frontend should be running at http://localhost:5173 (or your configured port)

### 3. Test Upload Flow

1. Open browser to frontend URL
2. Navigate to Dashboard
3. Click "Upload Document"
4. Select a PDF or image
5. Watch upload progress
6. Verify document appears in list

### 4. Check Backend Logs

Backend terminal should show:
```
INFO:     127.0.0.1:xxxxx - "POST /upload_document HTTP/1.1" 200 OK
```

### 5. Verify in Supabase

**Storage:**
1. Go to Supabase Dashboard → Storage
2. Open `private-user-docs` bucket
3. Navigate to `user_test-user-123/{document_id}/`
4. Verify `source.pdf` exists

**Database:**
1. Go to Supabase Dashboard → SQL Editor
2. Run queries:
```sql
-- Check document
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

## Common Integration Issues

### CORS Errors

If you see CORS errors in browser console:

**Backend is already configured** to allow all origins (`allow_origins=["*"]`), but verify:

```python
# backend/app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

For production, change to:
```python
allow_origins=["https://yourdomain.com"],
```

### Network Errors

Verify both servers are running:
```bash
# Check backend
curl http://localhost:8080/docs

# Check frontend
curl http://localhost:5173
```

### Upload Timeout

For large files, increase timeout in frontend:

```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s

const response = await fetch(`${API_BASE_URL}/upload_document`, {
  method: "POST",
  body: formData,
  signal: controller.signal,
});

clearTimeout(timeoutId);
```

### File Type Validation

Backend only accepts: `application/pdf`, `image/png`, `image/jpeg`

Ensure frontend sends correct MIME type:
```typescript
const validTypes = ["application/pdf", "image/png", "image/jpeg"];
if (!validTypes.includes(file.type)) {
  throw new Error("Invalid file type");
}
```

## Next Steps

### 1. Add Authentication
```typescript
import { useAuth } from "@/contexts/AuthContext";

const { user } = useAuth();
const userId = user?.id || "anonymous";
```

### 2. Show Upload Progress
Use `XMLHttpRequest` for progress tracking:
```typescript
const xhr = new XMLHttpRequest();
xhr.upload.addEventListener("progress", (e) => {
  const percent = (e.loaded / e.total) * 100;
  setProgress(percent);
});
```

### 3. Add Document Library View
Create a dedicated page to browse all documents.

### 4. Implement Q&A Interface
Add chat interface to ask questions about documents.

### 5. Show Obligations/Actions
Display extracted payment obligations and action items.

## Environment Variables Summary

**Frontend (`.env`):**
```env
VITE_API_BASE_URL=http://localhost:8080
```

**Backend (`../.env`):**
```env
OPENAI_API_KEY=sk-proj-...
SUPABASE_URL=https://....supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJh...
SUPABASE_ANON_KEY=eyJh...
POSTGRES_CONNECTION_URL=postgresql://...
SUPABASE_STORAGE_BUCKET=private-user-docs
FILE_CHUNK_PAGE_LIMIT=3
```

## API Reference Quick Guide

| Endpoint | Method | Request | Response |
|----------|--------|---------|----------|
| `/upload_document` | POST | FormData: `user_id`, `file` | `{document_id, status}` |
| `/documents` | GET | Query: `user_id` | `[{document_id, file_name, ...}]` |
| `/documents/{id}/explain` | POST | FormData: `question_text` | `{answer_text, citations}` |

## Testing Checklist

- [ ] Backend starts without errors
- [ ] Frontend connects to backend
- [ ] File picker opens when clicking upload
- [ ] Upload shows progress indicator
- [ ] Success toast appears after upload
- [ ] Document appears in list
- [ ] Document visible in Supabase Storage
- [ ] Database tables populated correctly
- [ ] Q&A endpoint returns answers
- [ ] Error messages display correctly

---

**Ready to go!** Start both servers and test your upload flow. 🚀

