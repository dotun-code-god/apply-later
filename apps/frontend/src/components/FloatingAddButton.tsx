import { motion } from "framer-motion";
import { Plus } from "lucide-react";

interface FloatingAddButtonProps {
  onClick: () => void;
}

export function FloatingAddButton({ onClick }: FloatingAddButtonProps) {
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.4, type: "spring", bounce: 0.5 }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      className="fixed bottom-24 right-5 w-14 h-14 rounded-2xl gradient-hero shadow-glow flex items-center justify-center z-40 touch-manipulation"
      aria-label="Add new opportunity"
      style={{
        boxShadow: "0 8px 24px -4px hsl(221 83% 53% / 0.45), 0 2px 8px -2px hsl(221 83% 53% / 0.2)",
      }}
    >
      <Plus className="w-6 h-6 text-primary-foreground stroke-[2.5px]" />
    </motion.button>
  );
}
