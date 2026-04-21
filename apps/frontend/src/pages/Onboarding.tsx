import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Bookmark, Bell, Sparkles, ChevronRight, ChevronLeft, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const slides = [
  {
    icon: Link,
    title: "Save Any Link",
    description: "Found an opportunity? Paste the link — no forms, no hassle. We'll hold it for you.",
    gradient: "from-blue-500 to-indigo-600",
    bgTint: "bg-blue-50",
    step: "01",
  },
  {
    icon: Sparkles,
    title: "AI Extracts Everything",
    description: "Our AI automatically finds deadlines, requirements, and everything you need to know.",
    gradient: "from-violet-500 to-purple-600",
    bgTint: "bg-violet-50",
    step: "02",
  },
  {
    icon: Bell,
    title: "Never Miss a Deadline",
    description: "Smart reminders when applications open or deadlines approach. Stay ahead, effortlessly.",
    gradient: "from-emerald-500 to-teal-600",
    bgTint: "bg-emerald-50",
    step: "03",
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slide = slides[currentSlide];
  const isLast = currentSlide === slides.length - 1;

  const next = () => isLast ? navigate("/dashboard") : setCurrentSlide((s) => s + 1);
  const prev = () => setCurrentSlide((s) => s - 1);

  return (
    <div className="min-h-screen bg-background flex flex-col safe-area-top">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl gradient-hero flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">A</span>
          </div>
          <span className="font-semibold text-foreground text-[15px]">ApplyLater</span>
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-xl hover:bg-secondary touch-manipulation"
        >
          Skip
        </button>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 pt-4 pb-2">
        {slides.map((_, i) => (
          <motion.div
            key={i}
            animate={{
              width: i === currentSlide ? 28 : 8,
              backgroundColor: i === currentSlide
                ? "hsl(var(--primary))"
                : "hsl(var(--muted))",
            }}
            transition={{ duration: 0.3 }}
            className="h-2 rounded-full"
          />
        ))}
      </div>

      {/* Main slide */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="flex flex-col items-center text-center w-full"
          >
            {/* Step number */}
            <p className="text-[12px] font-bold text-primary uppercase tracking-[0.1em] mb-4">
              Step {slide.step}
            </p>

            {/* Icon */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", bounce: 0.45 }}
              className={cn(
                "w-24 h-24 rounded-3xl flex items-center justify-center mb-8 shadow-elevated bg-gradient-to-br",
                slide.gradient
              )}
            >
              <slide.icon className="w-11 h-11 text-white stroke-[1.8px]" />
            </motion.div>

            {/* Text */}
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-[26px] font-bold text-foreground mb-4 text-balance leading-tight"
            >
              {slide.title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-[16px] text-muted-foreground max-w-[280px] leading-relaxed"
            >
              {slide.description}
            </motion.p>
          </motion.div>
        </AnimatePresence>

        {/* Feature cards */}
        {currentSlide === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="flex gap-3 mt-10 w-full max-w-sm"
          >
            {["Scholarship", "Fellowship", "Grant", "Program"].map((tag) => (
              <div key={tag} className="flex-1 py-2 rounded-xl bg-primary/8 border border-primary/15 text-center">
                <span className="text-[10px] font-semibold text-primary">{tag}</span>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <div className="px-5 pb-8 pt-4 flex gap-3 safe-area-bottom">
        {currentSlide > 0 && (
          <Button
            variant="outline"
            onClick={prev}
            className="h-14 w-14 rounded-2xl border-border flex-shrink-0 p-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        )}

        <Button
          onClick={next}
          className="flex-1 h-14 rounded-2xl gradient-hero text-primary-foreground font-semibold text-[16px] hover:opacity-90 transition-opacity touch-manipulation shadow-glow"
        >
          {isLast ? "Get Started" : "Continue"}
          {!isLast && <ChevronRight className="w-5 h-5 ml-1 stroke-[2.5px]" />}
        </Button>
      </div>
    </div>
  );
}
