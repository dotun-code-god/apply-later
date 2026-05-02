import type { ComponentType } from "react";
import { Activity, Bell, LayoutDashboard, LogOut, Search, UserCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-provider";
import { cn } from "@/lib/utils";

type SidebarSection = "overview" | "discover" | "alerts" | "profile";

const NAV_ITEMS: Array<{
  icon: ComponentType<{ className?: string }>;
  label: string;
  section: SidebarSection;
  path: string;
}> = [
  { icon: LayoutDashboard, label: "Overview", section: "overview", path: "/dashboard" },
  { icon: Search, label: "Discover", section: "discover", path: "/search" },
  { icon: Bell, label: "Alerts", section: "alerts", path: "/alerts" },
  { icon: UserCircle2, label: "Profile", section: "profile", path: "/profile" },
];

interface DashboardSidebarProps {
  active: SidebarSection;
}

export function DashboardSidebar({ active }: DashboardSidebarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
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
          {NAV_ITEMS.map(({ icon: Icon, label, section, path }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                section === active ? "bg-primary text-primary-foreground" : "hover:bg-accent",
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}

          <button
            onClick={() => navigate("/dashboard#pipeline")}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-accent"
          >
            <Activity className="h-4 w-4" />
            <span>Pipeline</span>
          </button>
        </nav>

        <div className="mt-auto rounded-2xl border border-border/70 bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Signed in as</p>
          <p className="mt-1 font-medium">{user?.username ?? user?.email ?? "User"}</p>
          <Button
            variant="outline"
            className="mt-3 w-full justify-start rounded-xl"
            onClick={async () => {
              await logout();
              navigate("/login");
            }}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </aside>
  );
}
