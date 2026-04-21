import { motion } from "framer-motion";
import { Home, Search, Bell, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Home", path: "/dashboard" },
  { icon: Search, label: "Search", path: "/search" },
  { icon: Bell, label: "Alerts", path: "/alerts" },
  { icon: User, label: "Profile", path: "/profile" },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <motion.nav
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.1 }}
      className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom"
    >
      <div className="bg-background/95 backdrop-blur-xl border-t border-border">
        <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path === "/dashboard" && location.pathname === "/");

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "relative flex flex-col items-center justify-center w-16 h-full gap-0.5 transition-colors touch-manipulation no-select",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <motion.div
                  whileTap={{ scale: 0.85 }}
                  className="relative flex flex-col items-center gap-0.5"
                >
                  {/* Active pill indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="navActiveIndicator"
                      className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full"
                      transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                    />
                  )}

                  <item.icon
                    className={cn(
                      "w-[22px] h-[22px] transition-all",
                      isActive ? "stroke-[2.2px]" : "stroke-[1.8px]"
                    )}
                  />
                  <span className={cn(
                    "text-[10px] font-medium leading-none",
                    isActive ? "font-semibold" : ""
                  )}>
                    {item.label}
                  </span>
                </motion.div>
              </button>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}
