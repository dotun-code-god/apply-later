import { motion } from "framer-motion";
import { StatusBadge } from "./ui/status-badge";
import { Calendar, Clock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type ApplicationStatus = "not-open" | "open" | "closing-soon" | "closed";

export interface Application {
  id: string;
  title: string;
  organization: string;
  type: string;
  status: ApplicationStatus;
  deadline?: string;
  openingDate?: string;
  daysLeft?: number;
}

interface ApplicationCardProps {
  application: Application;
  onClick?: () => void;
  index?: number;
}

const statusLabels: Record<ApplicationStatus, string> = {
  "not-open": "Not Open Yet",
  "open": "Open",
  "closing-soon": "Closing Soon",
  "closed": "Closed",
};

// Generate a gradient background for the org avatar based on org name
function getOrgGradient(name: string): string {
  const gradients = [
    "from-blue-500 to-indigo-600",
    "from-violet-500 to-purple-600",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-600",
    "from-rose-500 to-pink-600",
    "from-cyan-500 to-blue-600",
  ];
  const index = name.charCodeAt(0) % gradients.length;
  return gradients[index];
}

export function ApplicationCard({ application, onClick, index = 0 }: ApplicationCardProps) {
  const isUrgent = application.daysLeft !== undefined && application.daysLeft <= 3;
  const orgInitial = application.organization.charAt(0).toUpperCase();
  const gradient = getOrgGradient(application.organization);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: [0.4, 0, 0.2, 1] }}
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-4 p-4 rounded-2xl cursor-pointer",
        "bg-card border border-border shadow-card",
        "active:scale-[0.985] transition-all duration-200",
        "hover:border-primary/30 hover:shadow-elevated",
        isUrgent && "border-warning/30 bg-warning/[0.02]"
      )}
    >
      {/* Org Avatar */}
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br",
        gradient
      )}>
        <span className="text-white font-bold text-lg leading-none">{orgInitial}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Top row: title */}
        <h3 className="font-semibold text-foreground text-[15px] leading-snug mb-1 truncate">
          {application.title}
        </h3>

        {/* Org name */}
        <p className="text-muted-foreground text-[13px] mb-2 truncate">
          {application.organization}
        </p>

        {/* Bottom row: badges + deadline */}
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={application.status}>
            {statusLabels[application.status]}
          </StatusBadge>

          <span className="text-[11px] font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
            {application.type}
          </span>

          {application.daysLeft !== undefined && application.status !== "closed" && (
            <span className={cn(
              "flex items-center gap-1 text-[11px] font-medium",
              isUrgent ? "text-warning" : "text-muted-foreground"
            )}>
              <Clock className="w-3 h-3" />
              {application.daysLeft}d left
            </span>
          )}

          {application.deadline && application.status === "closed" && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {application.deadline}
            </span>
          )}
        </div>
      </div>

      {/* Chevron */}
      <ChevronRight className="w-4 h-4 text-muted-foreground/50 flex-shrink-0 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />

      {/* Urgent left bar */}
      {isUrgent && (
        <div className="absolute left-0 top-3 bottom-3 w-[3px] bg-warning rounded-r-full" />
      )}
    </motion.div>
  );
}