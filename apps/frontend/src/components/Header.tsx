import { motion } from "framer-motion";
import { Bell } from "lucide-react";

interface HeaderProps {
  greeting?: string;
  subtitle?: string;
  showNotification?: boolean;
}

export function Header({ greeting = "Your Applications", subtitle, showNotification = true }: HeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      className="sticky top-0 z-30 bg-background/95 backdrop-blur-lg border-b border-border"
    >
      <div className="flex items-center justify-between px-5 py-4">
        {/* Logo + Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl gradient-hero flex items-center justify-center shadow-glow-sm flex-shrink-0">
            <span className="text-primary-foreground font-bold text-base leading-none">A</span>
          </div>
          <div>
            <h1 className="font-semibold text-base text-foreground leading-tight">ApplyLater</h1>
            <p className="text-[11px] text-muted-foreground leading-tight">Never miss an opportunity</p>
          </div>
        </div>

        {/* Actions */}
        {showNotification && (
          <button className="relative w-10 h-10 rounded-xl flex items-center justify-center hover:bg-secondary transition-colors touch-manipulation">
            <Bell className="w-5 h-5 text-muted-foreground" />
            {/* Unread dot */}
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose rounded-full border-2 border-background" />
          </button>
        )}
      </div>
    </motion.header>
  );
}
