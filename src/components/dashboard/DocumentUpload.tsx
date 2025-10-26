import { useState, useRef } from "react";
import { uploadDocument } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, FileText, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DocumentUploadProps {
  userId: string;
  onUploadComplete?: (documentId: string) => void;
}

export function DocumentUpload({ userId, onUploadComplete }: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
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

    // Validate file size (10MB limit)
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
    setUploadProgress("Uploading file...");

    try {
      const result = await uploadDocument(file, userId);
      
      setUploadProgress("Processing complete!");
      
      toast({
        title: "Upload successful!",
        description: (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>{file.name} has been processed.</span>
          </div>
        ),
      });

      // Callback for parent component
      onUploadComplete?.(result.document_id);

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload error:", error);
      
      setUploadProgress("");
      
      toast({
        title: "Upload failed",
        description: (
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-500" />
            <span>{error instanceof Error ? error.message : "Unknown error"}</span>
          </div>
        ),
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(""), 2000);
    }
  };

  return (
    <div className="space-y-2">
      <label className="cursor-pointer">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,image/png,image/jpeg"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
        <Button disabled={uploading} asChild className="w-full sm:w-auto">
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
      
      {uploadProgress && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {uploading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <FileText className="h-3 w-3" />
          )}
          <span>{uploadProgress}</span>
        </div>
      )}
    </div>
  );
}

