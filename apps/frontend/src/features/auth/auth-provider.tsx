import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi, type AuthUser } from '@/lib/api/auth-api';
import { tokenStore } from '@/lib/api/token-store';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: { email: string; password: string }) => Promise<void>;
  signup: (payload: { email: string; password: string; name?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  googleSignIn: (credential: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = async () => {
    await authApi.csrfToken();
    try {
      const me = await authApi.me();
      setUser(me);
      return;
    } catch {
      const refresh = await authApi.refresh().catch(() => null);
      if (!refresh?.accessToken) {
        throw new Error('Session unavailable');
      }
      tokenStore.setAccessToken(refresh.accessToken);
      const me = await authApi.me();
      setUser(me);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await refreshSession();
      } catch {
        tokenStore.clear();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (payload: { email: string; password: string }) => {
    const response = await authApi.login(payload);
    tokenStore.setAccessToken(response.accessToken);
    setUser(response.user);
  };

  const signup = async (payload: { email: string; password: string; name?: string }) => {
    const response = await authApi.signup(payload);
    tokenStore.setAccessToken(response.accessToken);
    setUser(response.user);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      tokenStore.clear();
      setUser(null);
    }
  };

  const googleSignIn = async (credential: string) => {
    const response = await authApi.googleIdentity(credential);
    tokenStore.setAccessToken(response.accessToken);
    setUser(response.user);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      signup,
      logout,
      refreshSession,
      googleSignIn,
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
