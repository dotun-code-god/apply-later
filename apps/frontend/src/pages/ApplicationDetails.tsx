import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Calendar, Building2, Clock, ExternalLink, Bell,
  FileText, CheckCircle2, Share2, GraduationCap, MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

const applicationData = {
  id: "1",
  title: "Chevening Scholarship 2026",
  organization: "UK Government",
  orgFull: "Foreign, Commonwealth & Development Office",
  type: "Scholarship",
  status: "open" as const,
  deadline: "November 5, 2026",
  openingDate: "August 6, 2026",
  daysLeft: 28,
  location: "United Kingdom",
  url: "https://www.chevening.org/scholarship",
  description:
    "Chevening is the UK Government's global scholarship programme, funded by the Foreign, Commonwealth and Development Office and partner organisations. Awards are made to outstanding emerging leaders to pursue a one-year master's degree at any UK university.",
  eligibility: [
    "Citizen of a Chevening-eligible country",
    "Return to your country for at least 2 years after the scholarship",
    "Completed all components of an undergraduate degree",
    "At least 2 years of work experience",
    "Apply to three different eligible UK university courses",
  ],
  documents: [
    "Academic transcripts",
    "Two reference letters",
    "Valid passport",
    "English language proficiency",
  ],
};

const statusConfig = {
  "not-open": { label: "Not Open Yet", bg: "bg-purple/8 border-purple/20", text: "text-purple" },
  "open": { label: "Open", bg: "bg-success/8 border-success/20", text: "text-success" },
  "closing-soon": { label: "Closing Soon", bg: "bg-warning/8 border-warning/20", text: "text-warning" },
  "closed": { label: "Closed", bg: "bg-rose/8 border-rose/20", text: "text-rose" },
};

export default function ApplicationDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const cfg = statusConfig[applicationData.status];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b border-border safe-area-top"
      >
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-secondary transition-colors touch-manipulation"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="text-[15px] font-semibold text-foreground">Details</span>
          <div className="flex items-center gap-1">
            <button className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-secondary transition-colors touch-manipulation">
              <Share2 className="w-4.5 h-4.5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </motion.header>

      <main className="pb-36">
        {/* Hero gradient band */}
        <div className={cn("px-5 pt-6 pb-5 border-b border-border", cfg.bg)}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Org avatar + name */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl gradient-hero flex items-center justify-center shadow-glow-sm flex-shrink-0">
                <GraduationCap className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <p className="text-[13px] text-muted-foreground">{applicationData.orgFull}</p>
                <p className="text-[15px] font-semibold text-foreground">{applicationData.organization}</p>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-[22px] font-bold text-foreground mb-3 text-balance leading-snug">
              {applicationData.title}
            </h1>

            {/* Badges row */}
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={applicationData.status}>
                {cfg.label}
              </StatusBadge>
              <span className="text-[11px] font-medium bg-secondary text-muted-foreground px-2.5 py-1 rounded-full">
                {applicationData.type}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <MapPin className="w-3 h-3" />
                {applicationData.location}
              </span>
            </div>
          </motion.div>
        </div>

        <div className="px-5 pt-5 space-y-6">
          {/* Timeline grid */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="grid grid-cols-2 gap-3"
          >
            <div className="p-4 rounded-2xl bg-secondary border border-border">
              <div className="flex items-center gap-1.5 text-muted-foreground text-[12px] mb-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Opens</span>
              </div>
              <p className="font-semibold text-foreground text-[14px]">{applicationData.openingDate}</p>
            </div>

            <div className={cn(
              "p-4 rounded-2xl border",
              applicationData.daysLeft <= 7
                ? "bg-warning/8 border-warning/25"
                : "bg-secondary border-border"
            )}>
              <div className="flex items-center gap-1.5 text-muted-foreground text-[12px] mb-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Deadline</span>
              </div>
              <p className={cn(
                "font-semibold text-[14px]",
                applicationData.daysLeft <= 7 ? "text-warning" : "text-foreground"
              )}>
                {applicationData.deadline}
              </p>
              {applicationData.daysLeft && (
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {applicationData.daysLeft} days left
                </p>
              )}
            </div>
          </motion.div>

          {/* About */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <h2 className="text-[16px] font-bold text-foreground mb-2">About</h2>
            <p className="text-muted-foreground text-[14px] leading-[1.65]">
              {applicationData.description}
            </p>
          </motion.div>

          {/* Eligibility */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <h2 className="text-[16px] font-bold text-foreground mb-3">Eligibility</h2>
            <div className="space-y-2">
              {applicationData.eligibility.map((req, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-success/5 border border-success/15">
                  <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                  <span className="text-[13px] text-foreground leading-snug">{req}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Required Documents */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <h2 className="text-[16px] font-bold text-foreground mb-3">Required Documents</h2>
            <div className="flex flex-wrap gap-2">
              {applicationData.documents.map((doc, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/5 border border-primary/15 text-[12px] font-medium text-primary">
                  <FileText className="w-3.5 h-3.5" />
                  {doc}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      {/* Fixed bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="fixed bottom-0 left-0 right-0 px-5 py-4 bg-background/95 backdrop-blur-lg border-t border-border safe-area-bottom"
      >
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 h-13 rounded-2xl border-border text-[15px] font-medium"
          >
            <Bell className="w-4 h-4 mr-2" />
            Remind Me
          </Button>
          <Button
            className="flex-1 h-13 rounded-2xl gradient-hero text-primary-foreground font-semibold text-[15px] hover:opacity-90 transition-opacity touch-manipulation"
            onClick={() => window.open(applicationData.url, "_blank")}
          >
            Apply Now
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
