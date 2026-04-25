import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/auth-provider';

/**
 * Must be nested inside <ProtectedRoute> (authentication is assumed).
 * Redirects authenticated-but-unverified users to /verify-email.
 */
export function VerifiedRoute() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user?.emailVerified) {
    return <Navigate to="/verify-email" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
