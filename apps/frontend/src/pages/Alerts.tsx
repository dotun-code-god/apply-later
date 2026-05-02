import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, BellOff, Calendar, Clock, ChevronRight, Settings2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { DashboardSidebar } from "@/components/DashboardSidebar";

const upcomingAlerts = [
  {
    id: 1,
    title: "Chevening Scholarship 2026",
    type: "deadline",
    date: "Nov 5, 2026",
    daysLeft: 28,
  },
  {
    id: 2,
    title: "Google Summer of Code",
    type: "closing-soon",
    date: "Apr 4, 2026",
    daysLeft: 3,
  },
  {
    id: 3,
    title: "Fulbright Program",
    type: "opening",
    date: "May 1, 2026",
    daysLeft: 14,
  },
];

const alertTypeConfig: Record<string, { label: string; bg: string; text: string }> = {
  "closing-soon": { label: "Closing Soon", bg: "bg-warning/10 border-warning/20", text: "text-warning" },
  "opening": { label: "Opening Soon", bg: "bg-success/10 border-success/20", text: "text-success" },
  deadline: { label: "Deadline", bg: "bg-primary/10 border-primary/20", text: "text-primary" },
};

export default function Alerts() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen md:grid-cols-[260px_1fr]">
        <DashboardSidebar active="alerts" />

        <main className="w-full">
          <header className="border-b border-border/70 bg-background/80 px-5 py-4 backdrop-blur-xl md:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-3xl font-semibold">Alerts</h1>
                <p className="text-sm text-muted-foreground">Stay on top of every deadline and reminder.</p>
              </div>
              <button className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-secondary">
                <Settings2 className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </header>

          <div className="space-y-6 px-5 py-6 md:px-8">
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Push Notifications</p>
                    <p className="text-xs text-muted-foreground">Alerts on this device</p>
                  </div>
                </div>
                <Switch checked={pushEnabled} onCheckedChange={setPushEnabled} />
              </div>

              <div className="h-px bg-border" />

              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Email Digest</p>
                    <p className="text-xs text-muted-foreground">Weekly reminder summary</p>
                  </div>
                </div>
                <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 }}
            >
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Upcoming</h2>

              {upcomingAlerts.length > 0 ? (
                <div className="space-y-3">
                  {upcomingAlerts.map((alert, index) => {
                    const cfg = alertTypeConfig[alert.type];
                    return (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08 + index * 0.06 }}
                        className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4"
                      >
                        <div
                          className={cn(
                            "w-0.75 self-stretch rounded-full",
                            alert.type === "closing-soon" && "bg-warning",
                            alert.type === "opening" && "bg-success",
                            alert.type === "deadline" && "bg-primary",
                          )}
                        />

                        <div className="min-w-0 flex-1">
                          <p className="mb-1 truncate text-sm font-semibold text-foreground">{alert.title}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {alert.date}
                            </span>
                            <span className={cn("inline-flex items-center gap-1 font-medium", alert.daysLeft <= 7 && "text-warning")}>
                              <Clock className="h-3.5 w-3.5" />
                              {alert.daysLeft}d
                            </span>
                          </div>
                        </div>

                        <span className={cn("rounded-full border px-2.5 py-1 text-[11px] font-semibold", cfg.bg, cfg.text)}>
                          {cfg.label}
                        </span>

                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-border bg-card py-12 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
                    <BellOff className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                  <h3 className="mb-1 text-base font-semibold text-foreground">No upcoming alerts</h3>
                  <p className="text-sm text-muted-foreground">Save opportunities to start receiving reminders.</p>
                </div>
              )}
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14 }}
              className="rounded-2xl border border-primary/15 bg-primary/5 p-4"
            >
              <p className="mb-1 text-sm font-semibold text-foreground">Reminder Preferences</p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Alerts are configured for 7 days, 3 days, and 24 hours before each deadline. Per-opportunity customization
                will be available from the details workflow.
              </p>
            </motion.section>
          </div>
        </main>
      </div>
    </div>
  );
}
