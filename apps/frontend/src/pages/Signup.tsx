import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useAuth } from "@/features/auth/auth-provider";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { useToast } from "@/hooks/use-toast";

export default function Signup() {
  const navigate = useNavigate();
  const { signup, googleSignIn } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords must match.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await signup({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      navigate("/verify-email");
    } catch {
      toast({
        title: "Sign up failed",
        description: "This email might already exist or is invalid.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(155deg,hsl(var(--background)),hsl(var(--secondary)/0.72),hsl(var(--primary)/0.1))] px-4 py-8 md:px-8">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mx-auto w-full max-w-lg rounded-3xl border border-border/70 bg-card p-6 shadow-xl md:p-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl gradient-hero text-xs font-semibold text-primary-foreground">A</span>
          ApplyLater
        </Link>

        <h1 className="mt-5 font-display text-3xl font-semibold">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Set up your workspace to start tracking opportunities.</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Full name</label>
            <Input
              required
              placeholder="Alex Johnson"
              className="h-11 rounded-xl"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Email</label>
            <Input
              type="email"
              required
              placeholder="you@example.com"
              className="h-11 rounded-xl"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Password</label>
            <Input
              type="password"
              required
              placeholder="At least 8 characters"
              className="h-11 rounded-xl"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Confirm password</label>
            <Input
              type="password"
              required
              placeholder="Repeat your password"
              className="h-11 rounded-xl"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
              }
            />
          </div>
          <Button type="submit" className="h-11 w-full rounded-xl" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Sign up"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs uppercase tracking-wide text-muted-foreground">or</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <GoogleSignInButton
          buttonText="signup_with"
          onCredential={async (credential) => {
            try {
              await googleSignIn(credential);
              navigate("/dashboard");
            } catch {
              toast({
                title: "Google sign up failed",
                description: "Please try again.",
                variant: "destructive",
              });
            }
          }}
        />

        <p className="mt-5 text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Login</Link>
        </p>
      </motion.div>
    </div>
  );
}
