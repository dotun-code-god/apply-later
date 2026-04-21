import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type FilterType = "all" | "open" | "closing-soon" | "not-open" | "closed";

interface FilterTabsProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  counts: Record<FilterType, number>;
}

const filters: { value: FilterType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "closing-soon", label: "Closing Soon" },
  { value: "not-open", label: "Upcoming" },
  { value: "closed", label: "Closed" },
];

export function FilterTabs({ activeFilter, onFilterChange, counts }: FilterTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
      {filters.map((filter) => {
        const isActive = activeFilter === filter.value;
        return (
          <button
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={cn(
              "relative px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 touch-manipulation flex-shrink-0",
              isActive
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeFilter"
                className="absolute inset-0 gradient-hero rounded-full shadow-glow-sm"
                transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {filter.label}
              <span className={cn(
                "text-[10px] font-semibold px-1.5 py-0.5 rounded-full min-w-[18px] text-center",
                isActive
                  ? "bg-primary-foreground/25 text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}>
                {counts[filter.value]}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
