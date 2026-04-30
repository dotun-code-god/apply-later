import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Calendar, Building2, Clock, ExternalLink, Bell,
  FileText, Share2, GraduationCap, MapPin, Loader2, AlertCircle,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";
import { applicationsApi, type ApplicationDetail, type ApplicationStage } from "@/lib/api/applications-api";

const STAGE_LABEL: Record<ApplicationStage, string> = {
  ADDED: "Saved",
  REVIEWING: "Reviewing",
  PREPARING_DOCS: "Preparing docs",
  IN_PROGRESS: "In progress",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under review",
  INTERVIEW: "Interview",
  OFFER: "Offer received",
  REJECTED: "Rejected",
  CLOSED: "Closed",
  PARKED: "Parked",
};

type OpportunityStatus = "not-open" | "open" | "closing-soon" | "closed";

function deriveStatus(app: ApplicationDetail): OpportunityStatus {
  const now = new Date();
  if (app.opportunity.openDate && new Date(app.opportunity.openDate) > now) return "not-open";
  if (app.opportunity.deadline) {
    const deadline = new Date(app.opportunity.deadline);
    const diffMs = deadline.getTime() - now.getTime();
    if (diffMs >= 0 && diffMs <= 7 * 24 * 60 * 60 * 1000) return "closing-soon";
    if (deadline < now) return "closed";
  }
  if (["REJECTED", "CLOSED"].includes(app.currentStage)) return "closed";
  return "open";
}

const statusConfig: Record<OpportunityStatus, { label: string; bg: string; text: string }> = {
  "not-open": { label: "Not Open Yet", bg: "bg-purple/8 border-purple/20", text: "text-purple" },
  "open": { label: "Open", bg: "bg-success/8 border-success/20", text: "text-success" },
  "closing-soon": { label: "Closing Soon", bg: "bg-warning/8 border-warning/20", text: "text-warning" },
  "closed": { label: "Closed", bg: "bg-rose/8 border-rose/20", text: "text-rose" },
};

export default function ApplicationDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [app, setApp] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(false);
    applicationsApi
      .getById(id)
      .then(setApp)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading application…
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-muted-foreground">
        <AlertCircle className="h-6 w-6 text-warning" />
        <p>Could not load this application.</p>
        <Button variant="outline" className="rounded-xl" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
          Go back
        </Button>
      </div>
    );
  }

  const status = deriveStatus(app);
  const cfg = statusConfig[status];

  const openDateStr = app.opportunity.openDate
    ? new Date(app.opportunity.openDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;
  const deadlineStr = app.opportunity.deadline
    ? new Date(app.opportunity.deadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;
  const daysToDeadline = app.opportunity.deadline
    ? Math.ceil((new Date(app.opportunity.deadline).getTime() - Date.now()) / (24 * 60 * 60 * 1000))
    : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-lg safe-area-top"
      >
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-secondary transition-colors touch-manipulation"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <span className="text-[15px] font-semibold text-foreground">Details</span>
          <div className="flex items-center gap-1">
            <button className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-secondary transition-colors touch-manipulation">
              <Share2 className="h-4.5 w-4.5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </motion.header>

      <main className="pb-36">
        {/* Hero gradient band */}
        <div className={cn("border-b border-border px-5 pb-5 pt-6", cfg.bg)}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            {/* Org avatar + name */}
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl gradient-hero shadow-glow-sm">
                <GraduationCap className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                {app.opportunity.organizationName && (
                  <p className="text-[13px] text-muted-foreground">{app.opportunity.organizationName}</p>
                )}
                {app.opportunity.category && (
                  <p className="text-[15px] font-semibold text-foreground">{app.opportunity.category}</p>
                )}
              </div>
            </div>

            <h1 className="mb-3 text-balance text-[22px] font-bold leading-snug text-foreground">
              {app.title}
            </h1>

            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={status}>{cfg.label}</StatusBadge>
              <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                {STAGE_LABEL[app.currentStage]}
              </span>
              {app.opportunity.location && (
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {app.opportunity.location}
                </span>
              )}
            </div>
          </motion.div>
        </div>

        <div className="space-y-6 px-5 pt-5">
          {/* Timeline grid */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="grid grid-cols-2 gap-3"
          >
            <div className="rounded-2xl border border-border bg-secondary p-4">
              <div className="mb-1.5 flex items-center gap-1.5 text-[12px] text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>Opens</span>
              </div>
              <p className="text-[14px] font-semibold text-foreground">{openDateStr ?? "—"}</p>
            </div>

            <div
              className={cn(
                "rounded-2xl border p-4",
                (daysToDeadline ?? 999) <= 7 ? "border-warning/25 bg-warning/8" : "border-border bg-secondary",
              )}
            >
              <div className="mb-1.5 flex items-center gap-1.5 text-[12px] text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>Deadline</span>
              </div>
              <p
                className={cn(
                  "text-[14px] font-semibold",
                  (daysToDeadline ?? 999) <= 7 ? "text-warning" : "text-foreground",
                )}
              >
                {deadlineStr ?? "—"}
              </p>
              {daysToDeadline != null && (
                <p className="mt-0.5 text-[11px] text-muted-foreground">{daysToDeadline} days left</p>
              )}
            </div>
          </motion.div>

          {/* Extraction confidence */}
          {(app.opportunity.needsUserReview || app.latestExtraction?.needsUserReview) && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.14 }}
              className="rounded-xl border border-warning/35 bg-warning/10 p-3"
            >
              <p className="text-sm font-medium text-warning">Low-confidence extraction detected</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Some extracted fields may be incomplete or uncertain. Please review key details before applying.
              </p>
            </motion.div>
          )}

          {/* About */}
          {app.opportunity.description && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <h2 className="mb-2 text-[16px] font-bold text-foreground">About</h2>
              <p className="text-[14px] leading-[1.65] text-muted-foreground">{app.opportunity.description}</p>
            </motion.div>
          )}

          {/* Notes */}
          {app.notes && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.18 }}
            >
              <h2 className="mb-2 text-[16px] font-bold text-foreground">My Notes</h2>
              <p className="whitespace-pre-wrap text-[14px] leading-[1.65] text-muted-foreground">
                {app.notes}
              </p>
            </motion.div>
          )}

          {/* Stage history */}
          {app.stageHistory && app.stageHistory.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <button
                className="mb-3 flex w-full items-center justify-between text-[16px] font-bold text-foreground"
                onClick={() => setShowHistory((v) => !v)}
              >
                Stage History
                {showHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {showHistory && (
                <div className="space-y-2">
                  {[...app.stageHistory].reverse().map((event) => (
                    <div key={event.id} className="flex items-start gap-3 rounded-xl border border-border/60 bg-secondary/40 p-3">
                      <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                      <div>
                        <p className="text-[13px] font-semibold text-foreground">
                          {STAGE_LABEL[event.stage] ?? event.stage}
                        </p>
                        {event.note && <p className="text-[12px] text-muted-foreground">{event.note}</p>}
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {new Date(event.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Applicant count */}
          {app.opportunity.applicantCount > 1 && (
            <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-secondary/30 px-4 py-3 text-[13px] text-muted-foreground">
              <Building2 className="h-4 w-4" />
              {app.opportunity.applicantCount} people are tracking this opportunity
            </div>
          )}
        </div>
      </main>

      {/* Fixed bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 px-5 py-4 backdrop-blur-lg safe-area-bottom"
      >
        <div className="flex gap-3">
          <Button variant="outline" className="h-13 flex-1 rounded-2xl border-border text-[15px] font-medium">
            <Bell className="mr-2 h-4 w-4" />
            Remind Me
          </Button>
          <Button
            className="h-13 flex-1 rounded-2xl gradient-hero text-[15px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 touch-manipulation"
            onClick={() => window.open(app.sourceUrl, "_blank", "noopener,noreferrer")}
          >
            Apply Now
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
