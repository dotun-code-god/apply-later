import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, BellRing, CalendarClock, CheckCircle2, ClipboardList, LineChart, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: ClipboardList,
    title: "Capture Opportunities Fast",
    body: "Save scholarships, grants, jobs, and fellowships in seconds with a clean tracking board.",
  },
  {
    icon: CalendarClock,
    title: "Deadlines That Stay Visible",
    body: "See time-sensitive applications before they slip. Prioritize by urgency and stage.",
  },
  {
    icon: BellRing,
    title: "Actionable Alerts",
    body: "Configure reminders per opportunity so your team and your users stay aligned.",
  },
  {
    icon: LineChart,
    title: "Progress Analytics",
    body: "Track open rates, completion trends, and upcoming workload from one dashboard.",
  },
];

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 md:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl gradient-hero shadow-glow">
              <span className="font-display text-lg font-semibold text-primary-foreground">A</span>
            </div>
            <div>
              <p className="font-display text-lg font-semibold leading-tight">ApplyLater</p>
              <p className="text-xs text-muted-foreground">Application command center</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Button variant="ghost" className="hidden md:inline-flex" onClick={() => navigate("/login")}>
              Login
            </Button>
            <Button className="rounded-xl px-5" onClick={() => navigate("/signup")}>
              Start free
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.16),transparent_38%),radial-gradient(circle_at_78%_30%,hsl(var(--warning)/0.14),transparent_36%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--secondary)/0.55))]" />
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-16 md:grid-cols-2 md:items-center md:px-8 md:py-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                Built for web, ready for mobile API integration
              </p>
              <h1 className="font-display text-4xl font-semibold leading-tight md:text-6xl">
                Manage every opportunity with confidence
              </h1>
              <p className="mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
                A polished web experience to support API development now, with account flows and dashboard behavior ready for mobile app consumption later.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" className="h-12 rounded-xl px-6" onClick={() => navigate("/signup")}>
                  Create account
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="h-12 rounded-xl px-6" onClick={() => navigate("/dashboard")}>
                  View dashboard demo
                </Button>
              </div>
              <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <p className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-success" /> Secure auth flow</p>
                <p className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-success" /> Multi-role ready UX</p>
                <p className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-success" /> API-first architecture</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="relative"
            >
              <div className="rounded-3xl border border-border/70 bg-card/90 p-5 shadow-2xl backdrop-blur">
                <div className="mb-4 grid grid-cols-3 gap-3">
                  {["Open", "Closing", "Completed"].map((item, index) => (
                    <div key={item} className="rounded-2xl border border-border/70 bg-background p-3 text-center">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">{item}</p>
                      <p className="mt-1 font-display text-2xl font-semibold text-foreground">{[24, 8, 41][index]}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {[
                    ["Chevening Scholarship", "Closing in 3 days"],
                    ["UN Innovation Fellowship", "Interview stage"],
                    ["Product Analyst Role", "Needs recommendation letter"],
                  ].map(([name, status]) => (
                    <div key={name} className="flex items-center justify-between rounded-xl border border-border/60 bg-background px-3 py-2.5">
                      <p className="text-sm font-medium">{name}</p>
                      <p className="text-xs text-muted-foreground">{status}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-6 -left-4 hidden w-fit rounded-2xl border border-border/60 bg-background/90 px-4 py-3 shadow-lg md:block">
                <p className="text-xs text-muted-foreground">Reminder coverage</p>
                <p className="font-display text-xl font-semibold text-foreground">98%</p>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 py-16 md:px-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-wide text-primary">Product highlights</p>
              <h2 className="font-display text-3xl font-semibold">Everything you need for a web-first rollout</h2>
            </div>
            <Button variant="outline" className="rounded-xl" onClick={() => navigate("/login")}>
              Sign in to continue
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {features.map((feature, index) => (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className="rounded-2xl border border-border/70 bg-card p-6"
              >
                <feature.icon className="mb-4 h-6 w-6 text-primary" />
                <h3 className="font-display text-xl font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.body}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="border-t border-border/70 bg-secondary/50">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-5 px-5 py-16 text-center md:px-8">
            <ShieldCheck className="h-8 w-8 text-success" />
            <h2 className="font-display text-3xl font-semibold">Ready to test your API with a real user journey?</h2>
            <p className="max-w-2xl text-muted-foreground">
              Build and validate authentication, dashboard queries, and notification endpoints in a complete web product while your mobile app is in progress.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button className="rounded-xl px-6" onClick={() => navigate("/signup")}>Create your workspace</Button>
              <Button variant="outline" className="rounded-xl px-6" onClick={() => navigate("/login")}>I already have an account</Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
