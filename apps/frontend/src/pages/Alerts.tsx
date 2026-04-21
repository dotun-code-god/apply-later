import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, BellOff, Calendar, Clock, ChevronRight, Settings2 } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

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
  "opening":      { label: "Opening Soon", bg: "bg-success/10 border-success/20", text: "text-success" },
  "deadline":     { label: "Deadline",     bg: "bg-primary/10 border-primary/20", text: "text-primary" },
};

export default function Alerts() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);

  return (
    <div className="min-h-screen bg-background safe-area-top">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="px-5 pt-5 pb-4 sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b border-border"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-foreground">Alerts</h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">Stay on top of every deadline</p>
          </div>
          <button className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-secondary transition-colors touch-manipulation">
            <Settings2 className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </motion.div>

      <main className="px-5 pb-28 pt-5">
        {/* Notification toggles */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-border overflow-hidden mb-6"
        >
          {/* Push */}
          <div className="flex items-center justify-between p-4 bg-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-foreground">Push Notifications</p>
                <p className="text-[12px] text-muted-foreground">Alerts on your device</p>
              </div>
            </div>
            <Switch
              checked={pushEnabled}
              onCheckedChange={setPushEnabled}
            />
          </div>

          <div className="h-px bg-border" />

          {/* Email */}
          <div className="flex items-center justify-between p-4 bg-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <Bell className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-foreground">Email Digest</p>
                <p className="text-[12px] text-muted-foreground">Weekly summary email</p>
              </div>
            </div>
            <Switch
              checked={emailEnabled}
              onCheckedChange={setEmailEnabled}
            />
          </div>
        </motion.div>

        {/* Upcoming alerts */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Upcoming
          </h2>

          {upcomingAlerts.length > 0 ? (
            <div className="space-y-3">
              {upcomingAlerts.map((alert, index) => {
                const cfg = alertTypeConfig[alert.type];
                return (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.07 }}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border shadow-card touch-manipulation"
                  >
                    {/* Alert type dot bar */}
                    <div className={cn(
                      "w-[3px] self-stretch rounded-full flex-shrink-0",
                      alert.type === "closing-soon" && "bg-warning",
                      alert.type === "opening" && "bg-success",
                      alert.type === "deadline" && "bg-primary",
                    )} />

                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-foreground truncate mb-1">
                        {alert.title}
                      </p>
                      <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {alert.date}
                        </span>
                        <span className={cn(
                          "flex items-center gap-1 font-medium",
                          alert.daysLeft <= 7 && "text-warning"
                        )}>
                          <Clock className="w-3.5 h-3.5" />
                          {alert.daysLeft}d
                        </span>
                      </div>
                    </div>

                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-[11px] font-semibold border flex-shrink-0",
                      cfg.bg, cfg.text
                    )}>
                      {cfg.label}
                    </span>

                    <ChevronRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary flex items-center justify-center">
                <BellOff className="w-8 h-8 text-muted-foreground/40" />
              </div>
              <h3 className="text-[16px] font-semibold text-foreground mb-1">No upcoming alerts</h3>
              <p className="text-[13px] text-muted-foreground">
                Save some opportunities to get reminded
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Reminder settings info */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 p-4 rounded-2xl bg-primary/5 border border-primary/15"
        >
          <p className="text-[13px] font-semibold text-foreground mb-1">Reminder Preferences</p>
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            You'll be notified 7 days, 3 days, and 24 hours before each deadline. Customize per-opportunity from the detail page.
          </p>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
}