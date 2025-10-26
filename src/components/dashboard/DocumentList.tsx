import { useEffect, useState } from "react";
import { listDocuments, type DocumentSummary } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DocumentListProps {
  userId: string;
  refreshTrigger?: number;
  onDocumentSelect?: (documentId: string) => void;
}

export function DocumentList({ userId, refreshTrigger = 0, onDocumentSelect }: DocumentListProps) {
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, [userId, refreshTrigger]);

  const loadDocuments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const docs = await listDocuments(userId);
      setDocuments(docs);
    } catch (err) {
      console.error("Failed to load documents:", err);
      setError(err instanceof Error ? err.message : "Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processed":
        return "default";
      case "extracting":
        return "secondary";
      case "received":
        return "outline";
      default:
        return "outline";
    }
  };

  const getDocTypeColor = (type: string | null) => {
    switch (type) {
      case "bill":
        return "bg-blue-100 text-blue-800";
      case "lease":
        return "bg-purple-100 text-purple-800";
      case "nda":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No documents yet.</p>
            <p className="text-sm mt-1">Upload a document to get started!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <Card 
          key={doc.document_id}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onDocumentSelect?.(doc.document_id)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base truncate">{doc.file_name}</CardTitle>
                </div>
              </div>
              <Badge variant={getStatusColor(doc.status)} className="flex-shrink-0">
                {doc.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Type:</span>
              <Badge 
                variant="outline" 
                className={`text-xs ${getDocTypeColor(doc.detected_doc_type)}`}
              >
                {doc.detected_doc_type || "unknown"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

