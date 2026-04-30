import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link2, Clipboard, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddLinkDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string) => void;
}

export function AddLinkDrawer({ isOpen, onClose, onSubmit }: AddLinkDrawerProps) {
  const [url, setUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch (err) {
      console.error("Failed to read clipboard:", err);
    }
  };

  const handleSubmit = () => {
    if (!url.trim()) return;
    setIsProcessing(true);
    onSubmit(url);
    setUrl("");
    setIsProcessing(false);
    onClose();
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="px-5 pb-8">
        <DrawerHeader className="text-left px-0 pt-6">
          <DrawerTitle className="text-xl font-bold">Save Opportunity</DrawerTitle>
          <DrawerDescription className="text-muted-foreground">
            Paste any application link and we'll extract the details
          </DrawerDescription>
        </DrawerHeader>

        <div className="space-y-4 mt-4">
          {/* URL Input */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Link2 className="w-5 h-5 text-muted-foreground" />
            </div>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="pl-12 pr-12 h-14 text-base rounded-2xl bg-muted/50 border-border/50 focus:border-primary"
              autoFocus
            />
            <button
              onClick={handlePaste}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-muted transition-colors touch-manipulation"
            >
              <Clipboard className="w-5 h-5 text-primary" />
            </button>
          </div>

          {/* AI hint */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>AI will extract deadline, requirements & more</span>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!url.trim() || isProcessing}
            className={cn(
              "w-full h-14 rounded-2xl text-base font-semibold transition-all touch-manipulation",
              url.trim()
                ? "gradient-hero text-primary-foreground hover:opacity-90"
                : "bg-muted text-muted-foreground"
            )}
          >
            <AnimatePresence mode="wait">
              {isProcessing ? (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Extracting details...</span>
                </motion.div>
              ) : (
                <motion.span
                  key="save"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  Save Opportunity
                </motion.span>
              )}
            </AnimatePresence>
          </Button>

          {/* Quick actions */}
          <div className="pt-2">
            <p className="text-xs text-muted-foreground text-center mb-3">
              Supported sources
            </p>
            <div className="flex justify-center gap-2 flex-wrap">
              {["Jobs", "Scholarships", "Grants", "Fellowships", "Programs"].map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 text-xs rounded-full bg-muted text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}