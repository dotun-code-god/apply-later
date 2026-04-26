import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, KeyRound, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/lib/api/auth-api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password is too long'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetValues = z.infer<typeof resetSchema>;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const token = searchParams.get('token') ?? '';

  const form = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', confirmPassword: '' },
    mode: 'onTouched',
  });

  const password = form.watch('password');
  const confirmPassword = form.watch('confirmPassword');
  const confirmTouched = !!form.formState.touchedFields.confirmPassword;

  const onSubmit: SubmitHandler<ResetValues> = async (values) => {
    if (!token) {
      toast({ title: 'Invalid reset link', description: 'Missing reset token.', variant: 'destructive' });
      return;
    }
    try {
      await authApi.resetPassword(token, values.password);
      toast({ title: 'Password reset successful', description: 'Please log in with your new password.' });
      navigate('/login');
    } catch {
      form.setError('root', { message: 'Reset token may be invalid or expired.' });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(170deg,hsl(var(--secondary)/0.75),hsl(var(--background)))] px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md rounded-3xl border border-border/70 bg-card p-6 shadow-lg">
        <h1 className="font-display text-3xl font-semibold">Reset password</h1>
        <p className="mt-1 text-sm text-muted-foreground">Choose a new password for your account.</p>

        <Form {...form}>
          <form className="mt-6 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="At least 8 characters" className="h-11 rounded-xl" {...field} />
                  </FormControl>
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
                        'flex items-center gap-1 text-xs',
                        confirmPassword === password
                          ? 'text-green-600 dark:text-green-500'
                          : 'text-destructive',
                      )}
                    >
                      {confirmPassword === password ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                      {confirmPassword === password ? 'Passwords match' : 'Passwords do not match'}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.formState.errors.root && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {form.formState.errors.root.message}
              </p>
            )}
            <Button type="submit" className="h-11 w-full rounded-xl" disabled={form.formState.isSubmitting}>
              <KeyRound className="h-4 w-4" />
              {form.formState.isSubmitting ? 'Updating...' : 'Update password'}
            </Button>
          </form>
        </Form>

        <p className="mt-5 text-sm text-muted-foreground">
          Back to <Link to="/login" className="font-medium text-primary hover:underline">Login</Link>
        </p>
      </motion.div>
    </div>
  );
}
