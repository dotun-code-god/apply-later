import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/features/auth/auth-provider";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const signupSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username can be at most 30 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores allowed"),
    email: z.string().email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password is too long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupValues = z.infer<typeof signupSchema>;

function getPasswordStrength(pw: string): { label: string; level: 0 | 1 | 2 | 3 } {
  if (!pw) return { label: "", level: 0 };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  if (score <= 1) return { label: "Weak", level: 1 };
  if (score === 2) return { label: "Fair", level: 2 };
  return { label: "Strong", level: 3 };
}

export default function Signup() {
  const navigate = useNavigate();
  const { signup, googleSignIn } = useAuth();
  const { toast } = useToast();

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { username: "", email: "", password: "", confirmPassword: "" },
    mode: "onTouched",
  });

  const password = form.watch("password");
  const confirmPassword = form.watch("confirmPassword");
  const confirmTouched = !!form.formState.touchedFields.confirmPassword;
  const strength = getPasswordStrength(password);

  const onSubmit: SubmitHandler<SignupValues> = async (values) => {
    try {
      await signup({ username: values.username, email: values.email, password: values.password });
      navigate("/verify-email");
    } catch (err: unknown) {
      const msg: string =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "";
      if (/username/i.test(msg)) {
        form.setError("username", { message: "This username is already taken" });
      } else if (/email/i.test(msg)) {
        form.setError("email", { message: "This email is already registered" });
      } else {
        toast({
          title: "Sign up failed",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
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

        <Form {...form}>
          <form className="mt-6 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. alex_johnson" className="h-11 rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" className="h-11 rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="At least 8 characters" className="h-11 rounded-xl" {...field} />
                  </FormControl>
                  {password && (
                    <div className="space-y-1.5 pt-0.5">
                      <div className="flex gap-1">
                        {([1, 2, 3] as const).map((i) => (
                          <div
                            key={i}
                            className={cn(
                              "h-1 flex-1 rounded-full transition-colors duration-300",
                              strength.level >= i
                                ? strength.level === 1
                                  ? "bg-destructive"
                                  : strength.level === 2
                                    ? "bg-yellow-400"
                                    : "bg-green-500"
                                : "bg-border",
                            )}
                          />
                        ))}
                      </div>
                      <p
                        className={cn(
                          "text-xs",
                          strength.level === 1 && "text-destructive",
                          strength.level === 2 && "text-yellow-600 dark:text-yellow-400",
                          strength.level === 3 && "text-green-600 dark:text-green-500",
                        )}
                      >
                        {strength.label} password
                      </p>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="Repeat your password" className="h-11 rounded-xl" {...field} />
                  </FormControl>
                  {confirmTouched && confirmPassword && (
                    <p
                      className={cn(
                        "flex items-center gap-1 text-xs",
                        confirmPassword === password
                          ? "text-green-600 dark:text-green-500"
                          : "text-destructive",
                      )}
                    >
                      {confirmPassword === password ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                      {confirmPassword === password ? "Passwords match" : "Passwords do not match"}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="h-11 w-full rounded-xl" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Creating account..." : "Sign up"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </Form>

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
