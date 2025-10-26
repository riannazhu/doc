/**
 * Backend API Client
 * Connects to FastAPI backend for document processing
 */

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

