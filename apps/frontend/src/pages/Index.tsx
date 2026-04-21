import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Bookmark, Bell, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Bookmark,
    title: "Paste & Forget",
    description: "Just paste any application link. We handle the rest.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Extraction",
    description: "Deadlines, requirements, and details—automatically extracted.",
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    description: "Get notified when applications open or deadlines approach.",
  },
];

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 py-16">
        {/* Decorative gradient orbs */}
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-48 h-48 bg-primary/15 rounded-full blur-3xl" />
        
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
          className="w-20 h-20 rounded-3xl gradient-hero flex items-center justify-center shadow-glow mb-8"
        >
          <span className="text-4xl font-bold text-primary-foreground">A</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-5xl font-bold text-foreground text-center mb-4 text-balance"
        >
          Never Miss an
          <br />
          <span className="text-primary">Opportunity</span> Again
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-muted-foreground text-center max-w-md mb-10 text-balance"
        >
          Save application links instantly. Get reminded when deadlines approach. Apply when you're ready.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 w-full max-w-sm"
        >
          <Button
            size="lg"
            onClick={() => navigate("/onboarding")}
            className="flex-1 h-14 rounded-2xl gradient-hero text-primary-foreground font-semibold text-lg hover:opacity-90 transition-opacity"
          >
            Get Started
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/dashboard")}
            className="flex-1 h-14 rounded-2xl"
          >
            View Demo
          </Button>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center gap-6 mt-12 text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <span>Free to use</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <span>No sign-up required</span>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-bold text-foreground text-center mb-12"
          >
            How It Works
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative p-6 rounded-3xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-2xl gradient-hero flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-bold text-foreground mb-6"
          >
            Perfect for
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap justify-center gap-3"
          >
            {[
              "Scholarships",
              "Fellowships",
              "Grants",
              "Job Applications",
              "Accelerators",
              "Graduate Programs",
              "Research Funding",
              "Competitions",
            ].map((item) => (
              <span
                key={item}
                className="px-4 py-2 rounded-full bg-muted text-foreground text-sm font-medium"
              >
                {item}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center p-8 rounded-3xl gradient-hero shadow-glow"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
            Start Tracking Opportunities Today
          </h2>
          <p className="text-primary-foreground/80 mb-6">
            Join thousands of students and professionals who never miss a deadline.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/onboarding")}
            className="h-14 px-8 rounded-2xl bg-primary-foreground text-primary font-semibold text-lg hover:bg-primary-foreground/90 transition-colors"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-border/50">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">A</span>
            </div>
            <span className="font-semibold text-foreground">ApplyLater</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 ApplyLater. Never miss an opportunity.
          </p>
        </div>
      </footer>
    </div>
  );
}
