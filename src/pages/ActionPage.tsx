import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ActionPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { fileName, folderName, dueDate, message } = location.state || {};

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-surface p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/dashboard")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </header>

      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full space-y-8 animate-fade-in">
          <div className="bg-surface border border-border rounded-xl p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-accent/10 rounded-lg flex items-center justify-center">
                <FileText className="h-8 w-8 text-accent" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{fileName || "Document"}</h1>
                {folderName && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Location: {folderName}
                  </p>
                )}
              </div>
            </div>

            {(dueDate || message) && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
                <p className="text-lg font-medium">
                  {message || dueDate}
                </p>
              </div>
            )}

            <div className="space-y-3 pt-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase">
                Available Actions
              </h3>
              
              <Button
                variant="default"
                size="lg"
                className="w-full justify-start text-left h-auto py-4"
              >
                <div>
                  <div className="font-semibold">Take Primary Action</div>
                  <div className="text-sm opacity-80">Complete this task online</div>
                </div>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="w-full justify-start text-left h-auto py-4 hover:bg-accent/5 hover:border-accent"
              >
                <div>
                  <div className="font-semibold">Alternative Method</div>
                  <div className="text-sm opacity-80">Use mail-in or in-person option</div>
                </div>
              </Button>

              <Button
                variant="ghost"
                size="lg"
                className="w-full justify-start text-left h-auto py-4 hover:bg-accent/5"
              >
                <div>
                  <div className="font-semibold">Suggest Other Options</div>
                  <div className="text-sm opacity-80">Let Doc find more solutions</div>
                </div>
              </Button>

              <Button
                variant="ghost"
                size="lg"
                className="w-full justify-start text-left h-auto py-4 hover:bg-accent/5"
              >
                <div>
                  <div className="font-semibold">Explain This Document</div>
                  <div className="text-sm opacity-80">Get a plain-language summary</div>
                </div>
              </Button>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="font-semibold mb-4">Document Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">File Name:</span>
                <span>{fileName || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category:</span>
                <span>{folderName || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className={dueDate ? "text-warning" : "text-success"}>
                  {dueDate ? "Action Required" : "Up to Date"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}