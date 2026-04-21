import { motion } from "framer-motion";
import { Plus, Link } from "lucide-react";
import { Button } from "./ui/button";

interface EmptyStateProps {
  onAddClick: () => void;
}

export function EmptyState({ onAddClick }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      {/* Illustration */}
      <div className="relative mb-8">
        {/* Outer glow ring */}
        <div className="w-28 h-28 rounded-full bg-primary/5 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <div className="w-14 h-14 rounded-2xl gradient-hero flex items-center justify-center shadow-glow">
              <Link className="w-7 h-7 text-primary-foreground" />
            </div>
          </div>
        </div>

        {/* Floating dots decoration */}
        <motion.div
          animate={{ y: [-3, 3, -3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-success/30 border border-success/40"
        />
        <motion.div
          animate={{ y: [3, -3, 3] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-1 -left-2 w-3 h-3 rounded-full bg-warning/40 border border-warning/50"
        />
        <motion.div
          animate={{ y: [-2, 4, -2] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-2 -left-4 w-2.5 h-2.5 rounded-full bg-purple/30 border border-purple/40"
        />
      </div>

      <h3 className="text-xl font-bold text-foreground mb-2">
        No applications yet
      </h3>

      <p className="text-muted-foreground text-[15px] max-w-[260px] mb-8 leading-relaxed">
        Paste a link to any opportunity and we'll track it for you.
      </p>

      <Button
        onClick={onAddClick}
        className="h-12 px-7 rounded-2xl gradient-hero text-primary-foreground font-semibold text-[15px] hover:opacity-90 transition-opacity shadow-glow touch-manipulation"
      >
        <Plus className="w-5 h-5 mr-1.5 stroke-[2.5px]" />
        Add Your First Link
      </Button>
    </motion.div>
  );
}