import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { FilterTabs, type FilterType } from "@/components/FilterTabs";
import { ApplicationCard, type Application, type ApplicationStatus } from "@/components/ApplicationCard";
import { EmptyState } from "@/components/EmptyState";
import { FloatingAddButton } from "@/components/FloatingAddButton";
import { AddLinkDrawer } from "@/components/AddLinkDrawer";
import { BottomNav } from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";

const sampleApplications: Application[] = [
  {
    id: "1",
    title: "Chevening Scholarship 2026",
    organization: "UK Government",
    type: "Scholarship",
    status: "open",
    deadline: "Nov 5, 2026",
    daysLeft: 28,
  },
  {
    id: "2",
    title: "Google Summer of Code",
    organization: "Google",
    type: "Fellowship",
    status: "closing-soon",
    deadline: "Apr 4, 2026",
    daysLeft: 3,
  },
  {
    id: "3",
    title: "Fulbright Foreign Student Program",
    organization: "US Department of State",
    type: "Scholarship",
    status: "not-open",
    openingDate: "May 2026",
  },
  {
    id: "4",
    title: "TechStars Accelerator",
    organization: "TechStars",
    type: "Accelerator",
    status: "open",
    deadline: "Jun 30, 2026",
    daysLeft: 45,
  },
  {
    id: "5",
    title: "Rhodes Scholarship",
    organization: "Rhodes Trust",
    type: "Scholarship",
    status: "closed",
    deadline: "Oct 1, 2025",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>(sampleApplications);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);

  const filteredApplications = useMemo(() => {
    if (activeFilter === "all") return applications;
    return applications.filter((app) => app.status === activeFilter);
  }, [applications, activeFilter]);

  const counts: Record<FilterType, number> = useMemo(() => ({
    all: applications.length,
    open: applications.filter((a) => a.status === "open").length,
    "closing-soon": applications.filter((a) => a.status === "closing-soon").length,
    "not-open": applications.filter((a) => a.status === "not-open").length,
    closed: applications.filter((a) => a.status === "closed").length,
  }), [applications]);

  const handleAddLink = (url: string) => {
    const newApp: Application = {
      id: Date.now().toString(),
      title: "New Opportunity",
      organization: (() => {
        try { return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace("www.", ""); }
        catch { return url; }
      })(),
      type: "Processing…",
      status: "not-open",
    };
    setApplications((prev) => [newApp, ...prev]);
  };

  // Count closing-soon for subtitle urgency text
  const closingSoonCount = counts["closing-soon"];

  return (
    <div className="min-h-screen bg-background safe-area-top">
      <Header />

      <main className="px-5 pb-32">
        {/* Welcome section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05, ease: [0.4, 0, 0.2, 1] }}
          className="pt-5 pb-4"
        >
          <h2 className="text-[22px] font-bold text-foreground leading-tight">
            Your Applications
          </h2>
          <p className={`text-[14px] mt-0.5 ${closingSoonCount > 0 ? "text-warning font-medium" : "text-muted-foreground"}`}>
            {closingSoonCount > 0
              ? `⚡ ${closingSoonCount} opportunit${closingSoonCount === 1 ? "y" : "ies"} closing soon`
              : `${applications.length} opportunities tracked`}
          </p>
        </motion.div>

        {/* Quick stats row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
          className="grid grid-cols-3 gap-3 mb-5"
        >
          {[
            { label: "Open", value: counts.open, color: "text-success", bg: "bg-success/8 border-success/15" },
            { label: "Closing Soon", value: counts["closing-soon"], color: "text-warning", bg: "bg-warning/8 border-warning/15" },
            { label: "Upcoming", value: counts["not-open"], color: "text-purple", bg: "bg-purple/8 border-purple/15" },
          ].map((stat) => (
            <div key={stat.label} className={`p-3 rounded-2xl border ${stat.bg} text-center`}>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] text-muted-foreground font-medium mt-0.5 leading-tight">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Filter tabs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
          className="mb-4"
        >
          <FilterTabs
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            counts={counts}
          />
        </motion.div>

        {/* Applications list */}
        {filteredApplications.length > 0 ? (
          <div className="space-y-3">
            {filteredApplications.map((app, index) => (
              <ApplicationCard
                key={app.id}
                application={app}
                index={index}
                onClick={() => navigate(`/application/${app.id}`)}
              />
            ))}
          </div>
        ) : (
          <EmptyState onAddClick={() => setIsAddDrawerOpen(true)} />
        )}
      </main>

      <FloatingAddButton onClick={() => setIsAddDrawerOpen(true)} />

      <AddLinkDrawer
        isOpen={isAddDrawerOpen}
        onClose={() => setIsAddDrawerOpen(false)}
        onSubmit={handleAddLink}
      />

      <BottomNav />
    </div>
  );
}
