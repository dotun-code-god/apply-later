import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock3,
  DollarSign,
  ExternalLink,
  FileText,
  ListChecks,
  Loader2,
  MapPin,
  Paperclip,
  RefreshCw,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  ingestionJobsApi,
  applicationsApi,
  type ApplicationDetail,
  type ApplicationStage,
  type IntelligencePayload,
} from "@/lib/api/applications-api";
import { DashboardSidebar } from "@/components/DashboardSidebar";

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

const statusConfig: Record<OpportunityStatus, { label: string; tone: string }> = {
  "not-open": { label: "Not Open Yet", tone: "bg-purple/8 border-purple/20 text-purple" },
  open: { label: "Open", tone: "bg-success/8 border-success/20 text-success" },
  "closing-soon": { label: "Closing Soon", tone: "bg-warning/8 border-warning/20 text-warning" },
  closed: { label: "Closed", tone: "bg-rose/8 border-rose/20 text-rose" },
};

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

const PIPELINE_LABEL: Record<string, string> = {
  QUEUED: "Queued",
  EXTRACTING: "Extracting",
  NORMALIZING: "Normalizing",
  GATHERING: "Gathering",
  SYNCING: "Syncing",
  COMPLETED: "Synced",
  FAILED: "Failed",
};

function DetailsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-28 w-full rounded-2xl" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
      </div>
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-40 w-full rounded-2xl" />
    </div>
  );
}

export default function ApplicationDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [app, setApp] = useState<ApplicationDetail | null>(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const loadApplication = useCallback(async (mode: "initial" | "refresh", hasData = false) => {
    if (!id) return;

    const showPageLoading = mode === "initial" || (mode === "refresh" && !hasData);

    if (showPageLoading) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError(false);

    try {
      const data = await applicationsApi.getById(id);
      setApp(data);
    } catch {
      if (!hasData) {
        setError(true);
      }
    } finally {
      if (showPageLoading) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  }, [id]);

  useEffect(() => {
    void loadApplication("initial", false);
  }, [loadApplication]);

  useEffect(() => {
    setShowFullDescription(false);
  }, [app?.id]);

  const refreshFromSource = useCallback(async () => {
    if (!id) return;

    setError(false);
    setLoading(true);
    setRefreshing(true);

    try {
      const response = await applicationsApi.refreshById(id);

      for (let i = 0; i < 60; i++) {
        const job = await ingestionJobsApi.getById(response.jobId);
        if (job.status !== "PENDING") {
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 900));
      }
    } catch {
      // Fall through to a full fetch; errors will be handled by loadApplication.
    } finally {
      setRefreshing(false);
    }

    await loadApplication("initial", false);
  }, [id, loadApplication]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-muted-foreground">
        <AlertCircle className="h-6 w-6 text-warning" />
        <p>Could not load this application.</p>
        <Button
          variant="outline"
          className="rounded-xl"
          onClick={() => void refreshFromSource()}
          disabled={refreshing || loading}
        >
          {refreshing || loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Refresh details
        </Button>
        <Button variant="outline" className="rounded-xl" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Button>
      </div>
    );
  }

  const status = app ? deriveStatus(app) : "open";
  const statusMeta = statusConfig[status];
  const intel: IntelligencePayload | null =
    (app?.latestExtraction?.payload as IntelligencePayload | null | undefined) ?? null;
  const summaryText = intel?.overview.summary ?? app?.opportunity.summary ?? null;
  const fullDescriptionText = intel?.overview.description ?? app?.opportunity.description ?? null;
  const canToggleDescription = Boolean(summaryText && fullDescriptionText && summaryText !== fullDescriptionText);
  const descriptionHeading = showFullDescription && canToggleDescription ? "Full Description" : "Summary";
  const descriptionText = showFullDescription && canToggleDescription
    ? fullDescriptionText
    : summaryText ?? fullDescriptionText;

  const openDateStr = app?.opportunity.openDate
    ? new Date(app.opportunity.openDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "-";
  const deadlineStr = app?.opportunity.deadline
    ? new Date(app.opportunity.deadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "-";
  const pipelineLabel = app?.pipeline.stage ? PIPELINE_LABEL[app.pipeline.stage] ?? app.pipeline.stage : "Ready";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen md:grid-cols-[260px_1fr]">
        <DashboardSidebar active="overview" />

        <main className="w-full">
          <header className="sticky top-0 z-20 border-b border-border/70 bg-background/80 px-5 py-4 backdrop-blur-xl md:px-8">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => navigate("/dashboard") }>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Application Details</p>
                  {loading ? (
                    <Skeleton className="mt-1 h-7 w-48 rounded-lg" />
                  ) : (
                    <h1 className="font-display text-2xl font-semibold">{app?.title}</h1>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => void refreshFromSource()}
                  disabled={loading || refreshing}
                >
                  {refreshing || loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  Refresh details
                </Button>

                {!loading && app && (
                  <Button
                    className="rounded-xl"
                    onClick={() => window.open(app.sourceUrl, "_blank", "noopener,noreferrer")}
                  >
                    Open Source
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </header>

          <div className="space-y-6 px-5 py-6 md:px-8">
            {loading ? (
              <DetailsSkeleton />
            ) : (
              <>
                {app && app.pipeline.isActive && (
                  <div className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3">
                    <p className="text-xs uppercase tracking-wide text-primary">Pipeline In Progress</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{pipelineLabel}</p>
                    <p className="text-xs text-muted-foreground">{app.pipeline.message ?? "Preparing this opportunity for your dashboard"}</p>
                  </div>
                )}

                {app && app.pipeline.stage === "FAILED" && (
                  <div className="rounded-2xl border border-rose/30 bg-rose/10 px-4 py-3">
                    <p className="text-sm font-medium text-rose">Pipeline sync failed</p>
                    <p className="text-xs text-muted-foreground">{app.pipeline.message ?? "Try saving the link again."}</p>
                  </div>
                )}

                {app && (
                  <>
                    <motion.section
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl border border-border/70 bg-card p-5"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={status}>{statusMeta.label}</StatusBadge>
                        <span className={cn("rounded-full border px-2.5 py-1 text-xs font-medium", statusMeta.tone)}>
                          {STAGE_LABEL[app.currentStage]}
                        </span>
                        <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">
                          {pipelineLabel}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        {app.opportunity.organizationName && (
                          <span className="inline-flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{app.opportunity.organizationName}</span>
                        )}
                        {app.opportunity.location && (
                          <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{app.opportunity.location}</span>
                        )}
                        {app.opportunity.amount && (
                          <span className="inline-flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" />{app.opportunity.amount}</span>
                        )}
                      </div>
                    </motion.section>

                    <div className="grid gap-4 xl:grid-cols-2">
                      <section className="rounded-2xl border border-border/70 bg-card p-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Opens</p>
                        <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium"><Calendar className="h-4 w-4 text-primary" />{openDateStr}</p>
                      </section>
                      <section className="rounded-2xl border border-border/70 bg-card p-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Deadline</p>
                        <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium"><Clock3 className="h-4 w-4 text-primary" />{deadlineStr}</p>
                      </section>
                    </div>

                    {descriptionText && (
                      <section className="rounded-2xl border border-border/70 bg-card p-4">
                        <div className="flex items-center justify-between gap-3">
                          <h2 className="font-display text-lg font-semibold">{descriptionHeading}</h2>
                          {canToggleDescription && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-xl px-3 text-xs"
                              onClick={() => setShowFullDescription((current) => !current)}
                            >
                              {showFullDescription ? "View summary" : "View full description"}
                            </Button>
                          )}
                        </div>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{descriptionText}</p>
                      </section>
                    )}

                    <div className="gap-x-[1em] md:columns-2 columns-1 mb-6">
                        {intel?.aiGuidance?.keyHighlights && intel.aiGuidance.keyHighlights.length > 0 && (
                        <section className="rounded-2xl border border-border/70 bg-card p-4 break-inside-avoid box-border mb-[1em]">
                            <h2 className="font-display text-lg font-semibold">Key Highlights</h2>
                            <ul className="mt-3 space-y-2">
                            {intel.aiGuidance.keyHighlights.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                {item}
                                </li>
                            ))}
                            </ul>
                        </section>
                        )}

                        {intel?.eligibilityAndRequirements?.eligibilityCriteria && intel.eligibilityAndRequirements.eligibilityCriteria.length > 0 && (
                        <section className="rounded-2xl border border-border/70 bg-card p-4 break-inside-avoid box-border mb-[1em]">
                            <h2 className="font-display text-lg font-semibold">Eligibility Criteria</h2>
                            <ul className="mt-3 space-y-2">
                            {intel.eligibilityAndRequirements.eligibilityCriteria.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <ListChecks className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                {item}
                                </li>
                            ))}
                            </ul>
                        </section>
                        )}

                        {intel?.eligibilityAndRequirements?.requiredDocuments && intel.eligibilityAndRequirements.requiredDocuments.length > 0 && (
                        <section className="rounded-2xl border border-border/70 bg-card p-4 break-inside-avoid box-border mb-[1em]">
                            <h2 className="font-display text-lg font-semibold">Required Documents</h2>
                            <ul className="mt-3 space-y-2">
                            {intel.eligibilityAndRequirements.requiredDocuments.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <Paperclip className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                {item}
                                </li>
                            ))}
                            </ul>
                        </section>
                        )}

                        {intel?.aiGuidance?.whatMakesAGoodApplication && (
                        <section className="rounded-2xl border border-primary/20 bg-primary/5 p-4 break-inside-avoid box-border mb-[1em]">
                            <div className="mb-2 flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <h2 className="font-display text-lg font-semibold">What Makes A Good Application</h2>
                            </div>
                            <p className="text-sm leading-6 text-muted-foreground">{intel.aiGuidance.whatMakesAGoodApplication}</p>
                        </section>
                        )}

                        {intel?.aiGuidance?.caveats && (
                        <section className="rounded-2xl border border-rose/20 bg-rose/5 p-4 break-inside-avoid box-border mb-[1em]">
                            <div className="mb-2 flex items-center gap-2">
                            <ShieldAlert className="h-4 w-4 text-rose" />
                            <h2 className="font-display text-lg font-semibold">Things To Avoid</h2>
                            </div>
                            <p className="text-sm leading-6 text-muted-foreground">{intel.aiGuidance.caveats}</p>
                        </section>
                        )}
                    </div>

                    {app.stageHistory.length > 0 && (
                      <section className="rounded-2xl border border-border/70 bg-card p-4">
                        <h2 className="font-display text-lg font-semibold">Stage History</h2>
                        <div className="mt-3 space-y-2">
                          {[...app.stageHistory].reverse().map((event) => (
                            <div key={event.id} className="flex items-start gap-3 rounded-xl border border-border/60 bg-secondary/30 p-3">
                              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                              <div>
                                <p className="text-sm font-medium text-foreground">{STAGE_LABEL[event.stage] ?? event.stage}</p>
                                {event.note && <p className="text-xs text-muted-foreground">{event.note}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
