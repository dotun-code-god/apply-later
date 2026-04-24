import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { authApi } from '@/lib/api/auth-api';
import { useToast } from '@/hooks/use-toast';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!token) {
      toast({
        title: 'Invalid reset link',
        description: 'Missing reset token.',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Password mismatch',
        description: 'Passwords must match.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await authApi.resetPassword(token, password);
      toast({ title: 'Password reset successful', description: 'Please log in with your new password.' });
      navigate('/login');
    } catch {
      toast({
        title: 'Reset failed',
        description: 'Reset token may be invalid or expired.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(170deg,hsl(var(--secondary)/0.75),hsl(var(--background)))] px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md rounded-3xl border border-border/70 bg-card p-6 shadow-lg">
        <h1 className="font-display text-3xl font-semibold">Reset password</h1>
        <p className="mt-1 text-sm text-muted-foreground">Choose a new password for your account.</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="mb-1.5 block text-sm font-medium">New password</label>
            <Input type="password" required minLength={8} className="h-11 rounded-xl" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Confirm password</label>
            <Input type="password" required minLength={8} className="h-11 rounded-xl" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
          <Button type="submit" className="h-11 w-full rounded-xl" disabled={isSubmitting}>
            <KeyRound className="h-4 w-4" />
            {isSubmitting ? 'Updating...' : 'Update password'}
          </Button>
        </form>

        <p className="mt-5 text-sm text-muted-foreground">
          Back to <Link to="/login" className="font-medium text-primary hover:underline">Login</Link>
        </p>
      </motion.div>
    </div>
  );
}
