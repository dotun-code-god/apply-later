import { motion } from "framer-motion";
import {
  User,
  Mail,
  Globe,
  Briefcase,
  ChevronRight,
  Settings,
  HelpCircle,
  Shield,
  LogOut,
  Edit3,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { DashboardSidebar } from "@/components/DashboardSidebar";

const menuSections = [
  {
    title: "Preferences",
    items: [
      { icon: Settings, label: "Settings", sub: "App preferences" },
      { icon: Shield, label: "Privacy & Security", sub: "Manage your data" },
    ],
  },
  {
    title: "Support",
    items: [{ icon: HelpCircle, label: "Help & Support", sub: "FAQs and contact" }],
  },
];

const profileFields = [
  { icon: User, label: "Name", value: "Not set" },
  { icon: Mail, label: "Email", value: "Not set" },
  { icon: Globe, label: "Country", value: "Not set" },
  { icon: Briefcase, label: "Field of Interest", value: "Not set" },
];

export default function Profile() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen md:grid-cols-[260px_1fr]">
        <DashboardSidebar active="profile" />

        <main className="w-full">
          <header className="border-b border-border/70 bg-background/80 px-5 py-4 backdrop-blur-xl md:px-8">
            <h1 className="font-display text-3xl font-semibold">Profile</h1>
            <p className="text-sm text-muted-foreground">Manage your account details and preferences.</p>
          </header>

          <div className="mx-auto max-w-4xl space-y-6 px-5 py-6 md:px-8">
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-card"
            >
              <div className="absolute left-0 right-0 top-0 h-20 gradient-hero opacity-10" />

              <div className="relative p-5">
                <div className="mb-5 flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-16 w-16 border-2 border-background shadow-elevated">
                      <AvatarFallback className="gradient-hero text-xl font-bold text-primary-foreground">G</AvatarFallback>
                    </Avatar>
                    <button className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background gradient-hero">
                      <Edit3 className="h-2.5 w-2.5 text-primary-foreground" />
                    </button>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-foreground">Guest User</h2>
                    <p className="text-sm text-muted-foreground">Sign up to sync your data</p>
                  </div>
                </div>

                <button className="w-full rounded-2xl py-3.5 text-[15px] font-semibold text-primary-foreground shadow-glow-sm transition-opacity hover:opacity-90 gradient-hero">
                  Sign Up or Log In
                </button>
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="grid gap-3 sm:grid-cols-3"
            >
              {[
                { label: "Saved", value: "5", color: "text-primary", bg: "bg-primary/8 border-primary/15" },
                { label: "Applied", value: "0", color: "text-success", bg: "bg-success/8 border-success/15" },
                { label: "Alerts", value: "3", color: "text-warning", bg: "bg-warning/8 border-warning/15" },
              ].map((stat) => (
                <article key={stat.label} className={cn("rounded-2xl border p-3.5 text-center", stat.bg)}>
                  <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
                  <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">{stat.label}</p>
                </article>
              ))}
            </motion.section>

            <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your Details</h3>
              <div className="overflow-hidden rounded-2xl border border-border divide-y divide-border bg-card">
                {profileFields.map((field) => (
                  <button
                    key={field.label}
                    className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-secondary/50"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary">
                      <field.icon className="h-4.5 w-4.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="mb-0.5 text-[11px] leading-none text-muted-foreground">{field.label}</p>
                      <p className="text-sm font-medium text-foreground">{field.value}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                  </button>
                ))}
              </div>
            </motion.section>

            {menuSections.map((section, si) => (
              <motion.section
                key={section.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + si * 0.05 }}
              >
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{section.title}</h3>
                <div className="overflow-hidden rounded-2xl border border-border divide-y divide-border bg-card">
                  {section.items.map((item) => (
                    <button
                      key={item.label}
                      className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-secondary/50"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary">
                        <item.icon className="h-4.5 w-4.5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.sub}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                    </button>
                  ))}
                </div>
              </motion.section>
            ))}

            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose/20 bg-rose/5 p-4 text-sm font-semibold text-rose transition-colors hover:bg-rose/10">
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </motion.section>
          </div>
        </main>
      </div>
    </div>
  );
}
