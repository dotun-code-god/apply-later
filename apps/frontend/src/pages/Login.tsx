import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useState } from "react";
import { useAuth } from "@/features/auth/auth-provider";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const navigate = useNavigate();
  const { login, googleSignIn } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setIsSubmitting(true);
      await login(form);
      navigate("/dashboard");
    } catch {
      toast({
        title: "Login failed",
        description: "Check your credentials and email verification status.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(160deg,hsl(var(--secondary)/0.8),hsl(var(--background))_42%,hsl(var(--primary)/0.09))] px-4 py-8 md:px-8">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-border/70 bg-card shadow-xl md:grid-cols-2">
        <section className="hidden bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.24),transparent_40%),linear-gradient(135deg,hsl(var(--primary)),hsl(234_89%_58%))] p-8 text-primary-foreground md:block">
          <div className="flex h-full flex-col justify-between">
            <div>
              <p className="text-sm uppercase tracking-wide text-primary-foreground/80">Welcome back</p>
              <h1 className="mt-2 font-display text-4xl font-semibold leading-tight">Sign in and continue your application journey</h1>
              <p className="mt-4 max-w-sm text-sm text-primary-foreground/85">Use your account to track deadlines, collaborate with teammates, and power your mobile API workflows.</p>
            </div>
          </div>
        </section>

        <section className="p-6 md:p-10">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl gradient-hero text-xs font-semibold text-primary-foreground">A</span>
              ApplyLater
            </Link>

            <h2 className="font-display text-3xl font-semibold">Login to your account</h2>
            <p className="mt-1 text-sm text-muted-foreground">Continue where you left off.</p>

            <form className="mt-6 space-y-4" onSubmit={onSubmit}>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Email address</label>
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
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="block text-sm font-medium">Password</label>
                  <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
                </div>
                <PasswordInput
                  required
                  placeholder="Enter your password"
                  className="h-11 rounded-xl"
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                />
              </div>
              <Button type="submit" className="h-11 w-full rounded-xl" disabled={isSubmitting}>
                {isSubmitting ? "Logging in..." : "Login"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs uppercase tracking-wide text-muted-foreground">or</span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <div className="mt-4">
              <GoogleSignInButton
                onCredential={async (credential) => {
                  try {
                    await googleSignIn(credential);
                    navigate("/dashboard");
                  } catch(error) {
                    console.log({error});
                    toast({
                      title: "Google sign in failed",
                      description: "Please try again.",
                      variant: "destructive",
                    });
                  }
                }}
              />
            </div>

            <p className="mt-5 text-sm text-muted-foreground">
              New to ApplyLater? <Link to="/signup" className="font-medium text-primary hover:underline">Create an account</Link>
            </p>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
