import { motion } from "framer-motion";
import { Activity, Bell, Calendar, ChevronRight, Clock3, LayoutDashboard, LogOut, Search, Settings, UserCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const stats = [
  { label: "Total Applications", value: "73", note: "+9% this month" },
  { label: "Closing In 7 Days", value: "12", note: "Needs immediate action" },
  { label: "Pending Documents", value: "18", note: "Across 9 opportunities" },
  { label: "Completed Submissions", value: "31", note: "42% conversion" },
];

const pipeline = [
  ["Chevening Scholarship", "Document review", "Nov 05, 2026", "High"],
  ["UN Youth Fellowship", "Shortlisted", "Oct 27, 2026", "Medium"],
  ["MIT Solve Challenge", "Draft in progress", "Oct 22, 2026", "High"],
  ["Gates Cambridge", "Recommendation pending", "Nov 14, 2026", "Low"],
  ["Google PM Internship", "Application submitted", "Sep 19, 2026", "Low"],
];

const reminders = [
  ["Upload transcript for DAAD scholarship", "Today, 4:00 PM"],
  ["Finalize essay for Mastercard Foundation", "Tomorrow, 10:30 AM"],
  ["Review interview prep checklist", "Friday, 9:00 AM"],
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen md:grid-cols-[260px_1fr]">
        <aside className="hidden border-r border-border/70 bg-secondary/50 md:block">
          <div className="flex h-full flex-col px-5 py-6">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl gradient-hero">
                <span className="font-display text-lg font-semibold text-primary-foreground">A</span>
              </div>
              <div>
                <p className="font-display text-lg font-semibold">ApplyLater</p>
                <p className="text-xs text-muted-foreground">Web dashboard</p>
              </div>
            </div>

            <nav className="space-y-1">
              {[
                [LayoutDashboard, "Overview"],
                [Activity, "Applications"],
                [Calendar, "Calendar"],
                [Bell, "Alerts"],
                [Settings, "Settings"],
              ].map(([Icon, label], idx) => (
                <button
                  key={label as string}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                    idx === 0 ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label as string}</span>
                </button>
              ))}
            </nav>

            <div className="mt-auto rounded-2xl border border-border/70 bg-card p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Signed in as</p>
              <p className="mt-1 font-medium">Guest User</p>
              <Button variant="outline" className="mt-3 w-full justify-start rounded-xl" onClick={() => navigate("/login")}>
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </aside>

        <main className="w-full">
          <header className="border-b border-border/70 bg-background/80 px-5 py-4 backdrop-blur-xl md:px-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="font-display text-3xl font-semibold">Dashboard</h1>
                <p className="text-sm text-muted-foreground">Track your opportunities, reminders, and progress in one place.</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input className="h-10 w-[220px] rounded-xl pl-9" placeholder="Search applications" />
                </div>
                <Button className="rounded-xl">New Application</Button>
              </div>
            </div>
          </header>

          <div className="space-y-6 px-5 py-6 md:px-8">
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

            <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
              <section className="overflow-hidden rounded-2xl border border-border/70 bg-card">
                <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
                  <h2 className="font-display text-lg font-semibold">Application Pipeline</h2>
                  <Button variant="ghost" className="rounded-lg text-xs">See all</Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] text-sm">
                    <thead>
                      <tr className="bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="px-4 py-3 font-medium">Opportunity</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Deadline</th>
                        <th className="px-4 py-3 font-medium">Priority</th>
                        <th className="px-4 py-3 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pipeline.map((row) => (
                        <tr key={row[0]} className="border-t border-border/60">
                          <td className="px-4 py-3 font-medium">{row[0]}</td>
                          <td className="px-4 py-3 text-muted-foreground">{row[1]}</td>
                          <td className="px-4 py-3">{row[2]}</td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2.5 py-1 text-xs ${row[3] === "High" ? "bg-rose/15 text-rose" : row[3] === "Medium" ? "bg-warning/20 text-warning" : "bg-success/15 text-success"}`}>
                              {row[3]}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button className="inline-flex items-center gap-1 text-primary">
                              Open
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="space-y-4">
                <div className="rounded-2xl border border-border/70 bg-card p-4">
                  <h3 className="font-display text-lg font-semibold">Upcoming Reminders</h3>
                  <div className="mt-3 space-y-3">
                    {reminders.map((item) => (
                      <div key={item[0]} className="rounded-xl border border-border/60 bg-background p-3">
                        <p className="text-sm font-medium">{item[0]}</p>
                        <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock3 className="h-3.5 w-3.5" />
                          {item[1]}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4">
                  <p className="text-xs uppercase tracking-wide text-primary">API readyness</p>
                  <p className="mt-2 font-display text-xl font-semibold">Frontend ready for endpoint wiring</p>
                  <p className="mt-1 text-sm text-muted-foreground">Connect auth, applications list, and reminder APIs to replace demo data.</p>
                  <Button variant="outline" className="mt-4 rounded-xl" onClick={() => navigate("/signup")}>
                    <UserCircle2 className="h-4 w-4" />
                    Manage account
                  </Button>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
