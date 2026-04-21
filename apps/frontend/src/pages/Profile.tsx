import { motion } from "framer-motion";
import {
  User, Mail, Globe, Briefcase, ChevronRight,
  Settings, HelpCircle, Shield, LogOut, Edit3
} from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

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
    items: [
      { icon: HelpCircle, label: "Help & Support", sub: "FAQs and contact" },
    ],
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
    <div className="min-h-screen bg-background safe-area-top">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="px-5 pt-5 pb-4 sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b border-border"
      >
        <h1 className="text-[22px] font-bold text-foreground">Profile</h1>
      </motion.div>

      <main className="px-5 pb-28 pt-5 space-y-5">
        {/* Profile hero card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-card"
        >
          {/* Background gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-20 gradient-hero opacity-10" />

          <div className="relative p-5">
            <div className="flex items-center gap-4 mb-5">
              <div className="relative">
                <Avatar className="w-16 h-16 border-2 border-background shadow-elevated">
                  <AvatarFallback className="gradient-hero text-primary-foreground text-xl font-bold">
                    G
                  </AvatarFallback>
                </Avatar>
                <button className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full gradient-hero flex items-center justify-center border-2 border-background touch-manipulation">
                  <Edit3 className="w-2.5 h-2.5 text-primary-foreground" />
                </button>
              </div>
              <div className="flex-1">
                <h2 className="text-[17px] font-bold text-foreground">Guest User</h2>
                <p className="text-[13px] text-muted-foreground">Sign up to sync your data</p>
              </div>
            </div>

            <button className="w-full py-3.5 rounded-2xl gradient-hero text-primary-foreground font-semibold text-[15px] hover:opacity-90 transition-opacity touch-manipulation shadow-glow-sm">
              Sign Up or Log In
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { label: "Saved", value: "5", color: "text-primary", bg: "bg-primary/8 border-primary/15" },
            { label: "Applied", value: "0", color: "text-success", bg: "bg-success/8 border-success/15" },
            { label: "Alerts", value: "3", color: "text-warning", bg: "bg-warning/8 border-warning/15" },
          ].map((stat) => (
            <div
              key={stat.label}
              className={cn("p-3.5 rounded-2xl border text-center", stat.bg)}
            >
              <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
              <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Profile fields */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Your Details
          </h3>
          <div className="rounded-2xl border border-border overflow-hidden divide-y divide-border bg-card">
            {profileFields.map((field) => (
              <button
                key={field.label}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-secondary/50 transition-colors touch-manipulation"
              >
                <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                  <field.icon className="w-4.5 h-4.5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] text-muted-foreground leading-none mb-0.5">{field.label}</p>
                  <p className="text-[14px] font-medium text-foreground">{field.value}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
              </button>
            ))}
          </div>
        </motion.div>

        {/* Menu sections */}
        {menuSections.map((section, si) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + si * 0.05 }}
          >
            <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              {section.title}
            </h3>
            <div className="rounded-2xl border border-border overflow-hidden divide-y divide-border bg-card">
              {section.items.map((item) => (
                <button
                  key={item.label}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-secondary/50 transition-colors touch-manipulation"
                >
                  <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4.5 h-4.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] font-medium text-foreground">{item.label}</p>
                    <p className="text-[12px] text-muted-foreground">{item.sub}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                </button>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Sign out */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <button className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border border-rose/20 bg-rose/5 text-rose text-[14px] font-semibold touch-manipulation hover:bg-rose/10 transition-colors">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
}