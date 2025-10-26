import { useState, useEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DocumentUpload } from "./DocumentUpload";
import { DocumentList } from "./DocumentList";
import { askDocument } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const placeholderPhrases = [
  "explain this NDA",
  "translate this form to Mandarin",
  "fill in this form",
  "apply for this job with my research resume",
];

export const ChatInterface = () => {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<Array<{type: 'user' | 'assistant', text: string}>>([]);
  const [isAsking, setIsAsking] = useState(false);
  const { toast } = useToast();

  // TODO: Replace with actual user ID from auth context
  const userId = "00000000-0000-0000-0000-000000000001"; // Valid UUID format for testing

  useEffect(() => {
    const currentPhrase = placeholderPhrases[currentPhraseIndex];
    const typingSpeed = isDeleting ? 50 : 80;

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayedText.length < currentPhrase.length) {
          setDisplayedText(currentPhrase.slice(0, displayedText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 3500);
        }
      } else {
        if (displayedText.length > 0) {
          setDisplayedText(displayedText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setCurrentPhraseIndex((prev) => (prev + 1) % placeholderPhrases.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, currentPhraseIndex]);

  const handleUploadComplete = (documentId: string) => {
    console.log("Document uploaded:", documentId);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleDocumentSelect = (documentId: string) => {
    setSelectedDocId(documentId);
    setChatHistory([]);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    if (!selectedDocId) {
      toast({
        title: "No document selected",
        description: "Please select a document first or upload one.",
        variant: "destructive",
      });
      return;
    }

    const userMessage = message.trim();
    setMessage("");
    setChatHistory(prev => [...prev, { type: 'user', text: userMessage }]);
    setIsAsking(true);

    try {
      const response = await askDocument(selectedDocId, userMessage);
      setChatHistory(prev => [...prev, { type: 'assistant', text: response.answer_text }]);
    } catch (error) {
      console.error("Failed to ask question:", error);
      toast({
        title: "Question failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      setChatHistory(prev => [...prev, { type: 'assistant', text: "Sorry, I couldn't process that question. Please try again." }]);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col lg:flex-row gap-6 p-6 overflow-hidden">
      {/* Left Sidebar - Document List */}
      <aside className="w-full lg:w-80 flex-shrink-0 overflow-y-auto">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your Documents</h2>
          </div>
          
          <DocumentUpload 
            userId={userId}
            onUploadComplete={handleUploadComplete}
          />

          <DocumentList 
            userId={userId}
            refreshTrigger={refreshTrigger}
            onDocumentSelect={handleDocumentSelect}
          />
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {chatHistory.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center space-y-4 animate-fade-in max-w-2xl">
              <h1 className="text-2xl font-semibold">Welcome back, Rianna.</h1>
              
              <p className="text-muted-foreground">
                {selectedDocId 
                  ? "Ask me anything about your selected document!" 
                  : "Upload a document or select one from your library to get started"}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {chatHistory.map((msg, idx) => (
              <Card key={idx} className={msg.type === 'user' ? 'ml-auto max-w-[80%]' : 'mr-auto max-w-[80%]'}>
                <CardContent className="p-4">
                  <p className={msg.type === 'user' ? 'text-sm' : 'text-sm whitespace-pre-wrap'}>
                    {msg.text}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="flex-shrink-0">
          <form onSubmit={handleSend} className="relative">
            <div className="relative">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={selectedDocId ? `Ask Doc to ${displayedText}` : "Select a document first..."}
                disabled={!selectedDocId || isAsking}
                className="pr-12 h-12 bg-surface border-border text-foreground placeholder:text-muted-foreground"
              />
              <Button
                type="submit"
                size="icon"
                variant="ghost"
                disabled={!selectedDocId || isAsking || !message.trim()}
                className="absolute right-1 top-1 h-10 w-10"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};
