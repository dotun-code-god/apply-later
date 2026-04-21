import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerifyEmail() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.14),transparent_35%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--secondary)/0.7))] px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg rounded-3xl border border-border/70 bg-card p-7 text-center shadow-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-success/15 text-success">
          <CheckCircle2 className="h-7 w-7" />
        </div>

        <h1 className="mt-4 font-display text-3xl font-semibold">Verify your email</h1>
        <p className="mt-2 text-sm text-muted-foreground">We sent a verification link to your inbox. Confirm your email to activate your account.</p>

        <div className="mt-5 rounded-2xl border border-border/70 bg-background p-4 text-left text-sm">
          <p className="inline-flex items-center gap-2 font-medium"><Mail className="h-4 w-4 text-primary" /> Need help?</p>
          <p className="mt-1 text-muted-foreground">If you do not see the email, check spam or request another link in 30 seconds.</p>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button className="rounded-xl" onClick={() => navigate("/dashboard")}>Open dashboard</Button>
          <Button variant="outline" className="rounded-xl">Resend email</Button>
        </div>

        <p className="mt-5 text-sm text-muted-foreground">
          Wrong email? <Link to="/signup" className="font-medium text-primary hover:underline">Create account again</Link>
        </p>
      </motion.div>
    </div>
  );
}
