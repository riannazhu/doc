import { motion } from "framer-motion";
import { FileText, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export const DemoSection = () => {
  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto space-y-20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <h3 className="text-3xl font-bold text-center">See Doc in Action</h3>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-surface border border-border rounded-xl p-8 space-y-4 hover:border-primary transition-colors group">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-primary" />
                <h4 className="text-xl font-semibold">Document Explanation</h4>
              </div>
              <div className="bg-background rounded-lg p-6 space-y-4 border border-border">
                <div className="flex gap-4">
                  <div className="w-24 h-32 bg-muted rounded flex items-center justify-center text-xs">
                    NDA.pdf
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="bg-surface-hover rounded p-3 text-sm">
                      "Explain what this NDA means"
                    </div>
                    <div className="bg-primary/10 border border-primary/20 rounded p-3 text-sm text-muted-foreground animate-fade-in">
                      This Non-Disclosure Agreement protects confidential information shared between
                      parties. Key points: Must maintain secrecy for 5 years...
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Upload any document and get instant, plain-language explanations
              </p>
            </div>

            <div className="bg-surface border border-border rounded-xl p-8 space-y-4 hover:border-primary transition-colors group">
              <div className="flex items-center gap-3">
                <Bell className="h-6 w-6 text-primary" />
                <h4 className="text-xl font-semibold">Smart Notifications</h4>
              </div>
              <div className="bg-background rounded-lg p-6 space-y-4 border border-border">
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 space-y-3 animate-fade-in">
                  <p className="font-medium">Your passport expires in 3 months</p>
                  <div className="space-y-2">
                    <Button variant="default" size="sm" className="w-full">
                      Renew online
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      Renew by mail (Form DS-82)
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full">
                      Suggest other options
                    </Button>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Never miss important deadlines with proactive notifications
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
