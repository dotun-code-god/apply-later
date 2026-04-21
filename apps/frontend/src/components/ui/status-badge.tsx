import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium tracking-wide",
  {
    variants: {
      status: {
        "not-open": "bg-purple/10 text-purple border border-purple/20",
        "open": "bg-success/10 text-success border border-success/20",
        "closing-soon": "bg-warning/10 text-warning border border-warning/20",
        "closed": "bg-rose/10 text-rose border border-rose/20",
      },
    },
    defaultVariants: {
      status: "not-open",
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  children: React.ReactNode;
}

export function StatusBadge({ className, status, children, ...props }: StatusBadgeProps) {
  return (
    <span className={cn(statusBadgeVariants({ status }), className)} {...props}>
      <span className={cn(
        "w-1.5 h-1.5 rounded-full flex-shrink-0",
        status === "not-open" && "bg-purple",
        status === "open" && "bg-success animate-pulse-soft",
        status === "closing-soon" && "bg-warning animate-pulse-soft",
        status === "closed" && "bg-rose"
      )} />
      {children}
    </span>
  );
}
