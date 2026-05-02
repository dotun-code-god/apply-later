import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Bell, ChevronRight, Clock3, Search, UserCircle2, Loader2, AlertCircle, Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { dashboardApi, type DashboardSummary } from "@/lib/api/dashboard-api";
import {
  applicationsApi,
  ingestionJobsApi,
  type ApplicationListItem,
  type ApplicationFilter,
  type UpcomingReminder,
} from "@/lib/api/applications-api";
import { FilterTabs } from "@/components/FilterTabs";
import { AddLinkModal } from "@/components/AddLinkModal";
import { useIsMobile } from "@/hooks/use-mobile";
import { AddLinkDrawer } from "@/components/AddLinkDrawer";
import { cn } from "@/lib/utils";
import { DashboardSidebar } from "@/components/DashboardSidebar";

const STAGE_LABEL: Record<string, string> = {
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

const PRIORITY_FROM_STAGE: Record<string, "High" | "Medium" | "Low"> = {
  INTERVIEW: "High",
  OFFER: "High",
  PREPARING_DOCS: "High",
  IN_PROGRESS: "Medium",
  REVIEWING: "Medium",
  ADDED: "Low",
  SUBMITTED: "Low",
  UNDER_REVIEW: "Low",
  REJECTED: "Low",
  CLOSED: "Low",
  PARKED: "Low",
};

const PIPELINE_STAGE_LABEL: Record<string, string> = {
  QUEUED: "Queued",
  EXTRACTING: "Extracting",
  NORMALIZING: "Normalizing",
  GATHERING: "Gathering",
  SYNCING: "Syncing",
  COMPLETED: "Synced",
  FAILED: "Failed",
};

function derivePriority(app: ApplicationListItem): "High" | "Medium" | "Low" {
  if (app.isClosingSoon) return "High";
  return PRIORITY_FROM_STAGE[app.currentStage] ?? "Low";
}

type FilterTabValue = "all" | "open" | "closing-soon" | "not-open" | "closed";

function toApiFilter(tab: FilterTabValue): ApplicationFilter {
  if (tab === "not-open") return "not-open-yet";
  if (tab === "closed") return "completed";
  return tab;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [summaryError, setSummaryError] = useState(false);

  const [applications, setApplications] = useState<ApplicationListItem[]>([]);
  const [appsLoading, setAppsLoading] = useState(true);
  const [appsError, setAppsError] = useState(false);
  const [totalApps, setTotalApps] = useState(0);
  const [reminders, setReminders] = useState<UpcomingReminder[]>([]);
  const [remindersLoading, setRemindersLoading] = useState(true);
  const [remindersError, setRemindersError] = useState(false);

  const [activeFilter, setActiveFilter] = useState<FilterTabValue>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [addLinkOpen, setAddLinkOpen] = useState(false);

  // ─── Load summary ──────────────────────────────────────────────────────────
  useEffect(() => {
    dashboardApi.getSummary()
      .then(setSummary)
      .catch(() => setSummaryError(true));
  }, []);

  // ─── Load applications ─────────────────────────────────────────────────────
  const loadApplications = useCallback(async (filter: FilterTabValue, options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    if (!silent) {
      setAppsLoading(true);
      setAppsError(false);
    }
    try {
      const result = await applicationsApi.list({ filter: toApiFilter(filter), pageSize: 20 });
      setApplications(result.items);
      setTotalApps(result.total);
    } catch {
      if (!silent) {
        setAppsError(true);
      }
    } finally {
      if (!silent) {
        setAppsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadApplications(activeFilter);
  }, [activeFilter, loadApplications]);

  const loadUpcomingReminders = useCallback(async () => {
    setRemindersLoading(true);
    setRemindersError(false);
    try {
      const items = await applicationsApi.getUpcomingReminders(3);
      setReminders(items);
    } catch {
      setRemindersError(true);
    } finally {
      setRemindersLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUpcomingReminders();
  }, [loadUpcomingReminders]);

  // ─── Filter tab counts ─────────────────────────────────────────────────────
  const filterCounts = {
    all: totalApps,
    open: applications.filter((a) => !["REJECTED", "CLOSED", "PARKED", "SUBMITTED"].includes(a.currentStage)).length,
    "closing-soon": applications.filter((a) => a.isClosingSoon).length,
    "not-open": applications.filter((a) => a.openDate != null && new Date(a.openDate) > new Date()).length,
    closed: applications.filter((a) => ["REJECTED", "CLOSED", "SUBMITTED"].includes(a.currentStage)).length,
  };

  // ─── Search ────────────────────────────────────────────────────────────────
  const filtered = searchQuery.trim()
    ? applications.filter(
        (a) =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (a.organizationName ?? "").toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : applications;

  // ─── Intake link submit ────────────────────────────────────────────────────
  const handleIntakeSubmit = async (url: string) => {
    try {
      const response = await applicationsApi.intakeLink(url);
      void pollJob(response.jobId);
      void loadApplications(activeFilter);
      void loadUpcomingReminders();
    } catch {
      // drawer/modal handles its own UI state
    }
  };

  const pollJob = async (jobId: string) => {
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 800));
      try {
        const job = await ingestionJobsApi.getById(jobId);
        void loadApplications(activeFilter, { silent: true });
        if (job.status !== "PENDING") {
          void loadUpcomingReminders();
          break;
        }
      } catch {
        break;
      }
    }
  };

  // ─── Stats strip ──────────────────────────────────────────────────────────
  const stats = summary
    ? [
        { label: "Total Active", value: String(summary.totalActiveApplications), note: "In progress or reviewing" },
        { label: "Closing In 7 Days", value: String(summary.closingSoon), note: "Needs immediate action" },
        { label: "Pending Actions", value: String(summary.pendingActionsOrDocuments), note: "Docs or review needed" },
        { label: "Completed (30d)", value: String(summary.completedThisCycle), note: "Submitted this cycle" },
      ]
    : null;

  const getPipelineDisplay = (app: ApplicationListItem) => {
    const stageLabel = app.pipelineStage ? PIPELINE_STAGE_LABEL[app.pipelineStage] ?? app.pipelineStage : null;
    if (app.isPipelineActive) {
      return {
        tone: "active" as const,
        label: stageLabel ?? "Processing",
        detail: app.pipelineMessage ?? "Your link is being processed",
      };
    }

    if (app.pipelineStage === "FAILED") {
      return {
        tone: "failed" as const,
        label: "Needs retry",
        detail: app.pipelineMessage ?? "Sync failed",
      };
    }

    return {
      tone: "idle" as const,
      label: "Ready",
      detail: app.currentStatus ?? "Tracking",
    };
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen md:grid-cols-[260px_1fr]">
        <DashboardSidebar active="overview" />

        {/* ── Main ────────────────────────────────────────────────────────── */}
        <main className="w-full">
          <header className="border-b border-border/70 bg-background/80 px-5 py-4 backdrop-blur-xl md:px-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="font-display text-3xl font-semibold">Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Track your opportunities, reminders, and progress in one place.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="h-10 w-55 rounded-xl pl-9"
                    placeholder="Search applications"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button className="rounded-xl" onClick={() => setAddLinkOpen(true)}>
                  <Plus className="h-4 w-4" />
                  New Application
                </Button>
              </div>
            </div>
          </header>

          <div className="space-y-6 px-5 py-6 md:px-8">
            {/* ── Stats strip ─────────────────────────────────────────────── */}
            {stats ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat, idx) => (
                  <motion.article
                    key={stat.label}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.07 }}
                    className="rounded-2xl border border-border/70 bg-card p-4"
                  >
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{stat.label}</p>
                    <p className="mt-2 font-display text-3xl font-semibold">{stat.value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{stat.note}</p>
                  </motion.article>
                ))}
              </div>
            ) : summaryError ? (
              <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-card px-4 py-3 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4 text-warning" />
                Could not load summary stats.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-24 animate-pulse rounded-2xl border border-border/70 bg-card" />
                ))}
              </div>
            )}

            {/* ── Application pipeline ────────────────────────────────────── */}
            <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
              <section id="pipeline" className="overflow-hidden rounded-2xl border border-border/70 bg-card">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 px-4 py-3">
                  <h2 className="font-display text-lg font-semibold">Application Pipeline</h2>
                  <FilterTabs
                    activeFilter={activeFilter}
                    onFilterChange={(f) => setActiveFilter(f as FilterTabValue)}
                    counts={filterCounts}
                  />
                </div>

                {appsLoading ? (
                  <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading applications…
                  </div>
                ) : appsError ? (
                  <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4 text-warning" />
                    Failed to load applications.{" "}
                    <button className="underline" onClick={() => void loadApplications(activeFilter)}>
                      Retry
                    </button>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
                    <UserCircle2 className="h-8 w-8 opacity-30" />
                    <p className="text-sm">
                      {searchQuery ? "No matches found." : "No applications yet."}
                    </p>
                    {!searchQuery && (
                      <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setAddLinkOpen(true)}>
                        <Plus className="h-3.5 w-3.5" />
                        Save your first link
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-170 text-sm">
                      <thead>
                        <tr className="bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                          <th className="px-4 py-3 font-medium">Opportunity</th>
                          <th className="px-4 py-3 font-medium">Stage</th>
                          <th className="px-4 py-3 font-medium">Pipeline</th>
                          <th className="px-4 py-3 font-medium">Deadline</th>
                          <th className="px-4 py-3 font-medium">Priority</th>
                          <th className="px-4 py-3 font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((app) => {
                          const priority = derivePriority(app);
                          const pipeline = getPipelineDisplay(app);
                          const deadlineStr = app.deadline
                            ? new Date(app.deadline).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "—";
                          return (
                            <tr
                              key={app.id}
                              className="cursor-pointer border-t border-border/60 hover:bg-secondary/30"
                              onClick={() => navigate(`/applications/${app.id}`)}
                            >
                              <td className="px-4 py-3">
                                <p className="max-w-56 truncate font-medium">{app.title}</p>
                                {app.organizationName && (
                                  <p className="truncate text-xs text-muted-foreground">{app.organizationName}</p>
                                )}
                              </td>
                              <td className="px-4 py-3 text-muted-foreground">
                                {STAGE_LABEL[app.currentStage] ?? app.currentStage}
                              </td>
                              <td className="px-4 py-3">
                                <p
                                  className={cn(
                                    "text-xs font-medium",
                                    pipeline.tone === "active"
                                      ? "text-primary"
                                      : pipeline.tone === "failed"
                                        ? "text-rose"
                                        : "text-foreground",
                                  )}
                                >
                                  {pipeline.label}
                                </p>
                                <p className="max-w-52 truncate text-xs text-muted-foreground">{pipeline.detail}</p>
                              </td>
                              <td className="px-4 py-3">{deadlineStr}</td>
                              <td className="px-4 py-3">
                                <span
                                  className={cn(
                                    "rounded-full px-2.5 py-1 text-xs",
                                    priority === "High"
                                      ? "bg-rose/15 text-rose"
                                      : priority === "Medium"
                                      ? "bg-warning/20 text-warning"
                                      : "bg-success/15 text-success",
                                  )}
                                >
                                  {priority}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  className="inline-flex items-center gap-1 text-primary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/applications/${app.id}`);
                                  }}
                                >
                                  Open
                                  <ChevronRight className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              {/* ── Right column ─────────────────────────────────────────── */}
              <section className="space-y-4">
                <div className="rounded-2xl border border-border/70 bg-card p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-lg font-semibold">Upcoming Reminders</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 rounded-lg px-2 text-xs"
                      onClick={() => navigate("/alerts")}
                    >
                      View all
                    </Button>
                  </div>
                  <div className="mt-3 space-y-3">
                    {remindersLoading ? (
                      <div className="rounded-xl border border-border/60 bg-background p-3">
                        <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Loading reminders...
                        </p>
                      </div>
                    ) : remindersError ? (
                      <div className="rounded-xl border border-dashed border-border/70 bg-background p-3">
                        <p className="text-sm text-muted-foreground">Could not load reminders right now.</p>
                      </div>
                    ) : reminders.length > 0 ? (
                      reminders.map((item) => (
                        <div
                          key={item.id}
                          className="cursor-pointer rounded-xl border border-border/60 bg-background p-3 transition-colors hover:border-primary/30"
                          onClick={() =>
                            item.applicationId ? navigate(`/applications/${item.applicationId}`) : navigate("/alerts")
                          }
                        >
                          <p className="text-sm font-medium">{item.title}</p>
                          <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock3 className="h-3.5 w-3.5" />
                            {new Date(item.scheduledFor).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-xl border border-dashed border-border/70 bg-background p-3">
                        <p className="text-sm text-muted-foreground">No reminders scheduled right now.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-border/70 bg-card p-4">
                  <h3 className="font-display text-lg font-semibold">Quick Actions</h3>
                  <div className="mt-3 space-y-2">
                    <Button variant="outline" className="w-full justify-start rounded-xl" onClick={() => setAddLinkOpen(true)}>
                      <Plus className="h-4 w-4" />
                      Save new opportunity link
                    </Button>
                    <Button variant="outline" className="w-full justify-start rounded-xl" onClick={() => navigate("/alerts")}>
                      <Bell className="h-4 w-4" />
                      View reminders
                    </Button>
                  </div>
                </div>

                <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4">
                  <p className="text-xs uppercase tracking-wide text-primary">Stage 1 — Live</p>
                  <p className="mt-2 font-display text-xl font-semibold">Connected to real APIs</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Dashboard, pipeline list, and intake are now powered by the backend.
                  </p>
                  <Button variant="outline" className="mt-4 rounded-xl" onClick={() => navigate("/profile")}>
                    <UserCircle2 className="h-4 w-4" />
                    Manage account
                  </Button>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>

      {/* ── Add link modal (desktop) / drawer (mobile) ─────────────────────── */}
      {isMobile ? (
        <AddLinkDrawer
          isOpen={addLinkOpen}
          onClose={() => setAddLinkOpen(false)}
          onSubmit={(url) => void handleIntakeSubmit(url)}
        />
      ) : (
        <AddLinkModal
          isOpen={addLinkOpen}
          onClose={() => setAddLinkOpen(false)}
          onSubmit={(url) => void handleIntakeSubmit(url)}
        />
      )}
    </div>
  );
}
