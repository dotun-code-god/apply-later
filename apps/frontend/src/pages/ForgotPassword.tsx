import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { authApi } from "@/lib/api/auth-api";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPassword() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setIsSubmitting(true);
      await authApi.forgotPassword(email);
      toast({
        title: "Reset email sent",
        description: "If an account exists for this email, reset instructions were sent.",
      });
    } catch {
      toast({
        title: "Unable to send reset email",
        description: "Try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(170deg,hsl(var(--secondary)/0.8),hsl(var(--background)))] px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md rounded-3xl border border-border/70 bg-card p-6 shadow-lg">
        <h1 className="font-display text-3xl font-semibold">Forgot password</h1>
        <p className="mt-1 text-sm text-muted-foreground">Enter your email address and we will send password reset instructions.</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Email address</label>
            <Input
              type="email"
              required
              placeholder="you@example.com"
              className="h-11 rounded-xl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button type="submit" className="h-11 w-full rounded-xl" disabled={isSubmitting}>
            <MailCheck className="h-4 w-4" />
            {isSubmitting ? "Sending..." : "Send reset link"}
          </Button>
        </form>

        <p className="mt-5 text-sm text-muted-foreground">
          Remembered your password? <Link to="/login" className="font-medium text-primary hover:underline">Back to login</Link>
        </p>
      </motion.div>
    </div>
  );
}
