import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRef, useState, useCallback, useEffect, KeyboardEvent, ClipboardEvent, ChangeEvent } from "react";
import { authApi } from "@/lib/api/auth-api";
import { useAuth } from "@/features/auth/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

export default function VerifyEmail() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refreshSession } = useAuth();

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const startCooldown = useCallback(() => {
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => { if (cooldownRef.current) clearInterval(cooldownRef.current); }, []);

  const focusIndex = (index: number) => {
    inputRefs.current[Math.min(Math.max(index, 0), OTP_LENGTH - 1)]?.focus();
  };

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    if (value) focusIndex(index + 1);
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const next = [...digits];
        next[index] = "";
        setDigits(next);
      } else {
        focusIndex(index - 1);
      }
    } else if (e.key === "ArrowLeft") {
      focusIndex(index - 1);
    } else if (e.key === "ArrowRight") {
      focusIndex(index + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = [...digits];
    pasted.split("").forEach((char, i) => { next[i] = char; });
    setDigits(next);
    focusIndex(Math.min(pasted.length, OTP_LENGTH - 1));
  };

  const otp = digits.join("");
  const isComplete = otp.length === OTP_LENGTH;

  const handleSubmit = async () => {
    if (!isComplete || isSubmitting) return;
    try {
      setIsSubmitting(true);
      await authApi.verifyEmail(otp);
      // Refresh auth context so emailVerified flips to true
      await refreshSession().catch(() => null);
      toast({ title: "Email verified!", description: "Your account is now active." });
      navigate("/dashboard", { replace: true });
    } catch {
      toast({
        title: "Invalid code",
        description: "The code is wrong or has expired. Please try again.",
        variant: "destructive",
      });
      setDigits(Array(OTP_LENGTH).fill(""));
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      await authApi.resendVerification();
      startCooldown();
      toast({ title: "Code resent", description: "Check your inbox for a new code." });
      setDigits(Array(OTP_LENGTH).fill(""));
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } catch {
      toast({ title: "Could not resend", description: "Please try again shortly.", variant: "destructive" });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.14),transparent_35%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--secondary)/0.7))] px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl border border-border/70 bg-card p-8 text-center shadow-xl"
      >
        <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Mail className="h-7 w-7" />
            </div>

            <h1 className="mt-4 font-display text-2xl font-semibold">Check your inbox</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              We sent a 6-digit code to your email address. Enter it below to verify your account.
            </p>

            {/* OTP inputs */}
            <div className="mt-8 flex justify-center gap-2.5">
              {digits.map((digit, i) => (
                <Input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  className={cn(
                    "h-14 w-12 rounded-xl border-2 text-center text-xl font-bold tabular-nums transition-all",
                    "focus:border-primary focus:ring-0",
                    digit ? "border-primary bg-primary/5" : "border-border"
                  )}
                  autoComplete="one-time-code"
                />
              ))}
            </div>

            <Button
              className="mt-6 w-full rounded-xl"
              disabled={!isComplete || isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? "Verifying…" : "Verify Email"}
            </Button>

            <div className="mt-4 flex items-center justify-center gap-1.5">
              <span className="text-sm text-muted-foreground">Didn't receive a code?</span>
              <button
                type="button"
                disabled={resendCooldown > 0}
                onClick={handleResend}
                className={cn(
                  "inline-flex items-center gap-1 text-sm font-medium transition-colors",
                  resendCooldown > 0
                    ? "cursor-not-allowed text-muted-foreground"
                    : "text-primary hover:underline"
                )}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
              </button>
            </div>

            <p className="mt-5 text-sm text-muted-foreground">
              Wrong email?{" "}
              <Link to="/signup" className="font-medium text-primary hover:underline">
                Create account again
              </Link>
            </p>
        </>
      </motion.div>
    </div>
  );
}

