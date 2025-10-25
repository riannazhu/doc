import { useState, useEffect } from "react";
import { Upload, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      // Handle message send
      console.log("Sending message:", message);
      setMessage("");
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-3xl space-y-8">
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-2xl font-semibold">Welcome back, Rianna.</h1>
          
          <Button
            variant="hero"
            size="lg"
            className="rounded-full h-20 w-20 shadow-glow hover:shadow-elegant"
          >
            <Upload className="h-8 w-8" />
          </Button>
          
          <p className="text-sm text-muted-foreground">
            Upload documents or drag & drop files here
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {["Berkeley_Research_Resume.pdf", "NDA_Draft_v2.docx", "Tax_Form_2024.pdf", "Passport_Scan.pdf", "Lease_Agreement.pdf"].map((doc) => (
              <button
                key={doc}
                className="px-4 py-2 bg-surface hover:bg-accent/10 hover:border-accent border border-border rounded-lg text-sm transition-all"
              >
                {doc}
              </button>
            ))}
          </div>

          <form onSubmit={handleSend} className="relative">
            <div className="relative">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Ask Doc to ${displayedText}`}
                className="pr-12 h-12 bg-surface border-border text-foreground placeholder:text-muted-foreground"
              />
              <Button
                type="submit"
                size="icon"
                variant="ghost"
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
