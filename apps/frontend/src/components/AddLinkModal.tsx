import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Link, Sparkles, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface AddLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string) => void;
}

export function AddLinkModal({ isOpen, onClose, onSubmit }: AddLinkModalProps) {
  const [url, setUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = () => {
    if (!url.trim()) return;
    setIsProcessing(true);
    onSubmit(url);
    setUrl("");
    setIsProcessing(false);
    onClose();
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch (err) {
      console.error("Failed to paste:", err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-lg mx-auto"
          >
            <div className="bg-card rounded-3xl p-6 shadow-2xl border border-border">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
                    <Link className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg text-foreground">Save Application</h2>
                    <p className="text-sm text-muted-foreground">Paste any application link</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Input Area */}
              <div className="relative mb-4">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/scholarship..."
                  className={cn(
                    "w-full px-4 py-4 rounded-2xl text-foreground",
                    "bg-muted border-2 border-transparent",
                    "focus:border-primary focus:outline-none",
                    "placeholder:text-muted-foreground/60",
                    "transition-all duration-200"
                  )}
                />
                <button
                  onClick={handlePaste}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
                >
                  Paste
                </button>
              </div>

              {/* AI Hint */}
              <div className="flex items-center gap-2 mb-6 p-3 rounded-xl bg-primary/5 border border-primary/10">
                <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  AI will automatically extract details like deadlines, requirements, and more.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 h-12 rounded-xl"
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!url.trim() || isProcessing}
                  className="flex-1 h-12 rounded-xl gradient-hero text-primary-foreground font-medium hover:opacity-90 transition-opacity"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Save Link"
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
