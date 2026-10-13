'use client';

import { useRouter } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { toast } from 'sonner';
import type { DeviceData } from '../lib/device';
import { hasPermission } from '../rbac/can';
import type { AuthPermission, AuthUser } from '../types';

interface SignInOptions {
  email: string;
  password: string;
  phone?: string;
  deviceData?: DeviceData;
}

interface SignInResult {
  user: AuthUser;
  /** The backend's `message` for a successful login (may be null). */
  message: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (options: SignInOptions) => Promise<SignInResult>;
  signOut: () => Promise<string | null>;
  hasPermission: (permission: AuthPermission) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export interface AuthProviderProps {
  children: ReactNode;
  initialUser?: AuthUser | null;
}

export function AuthProvider({
  children,
  initialUser = null,
}: AuthProviderProps) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const [isLoading, setIsLoading] = useState(false);

  const signIn = useCallback(async (options: SignInOptions) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      });
      const data = (await response.json().catch(() => null)) as {
        user?: AuthUser;
        message?: string;
      } | null;

      if (!response.ok || !data?.user) {
        throw new Error(
          data?.message ?? 'Unable to sign in. Please try again.',
        );
      }

      setUser(data.user);
      return { user: data.user, message: data.message ?? null };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      const data = (await response.json().catch(() => null)) as {
        message?: string | null;
      } | null;

      setUser(null);
      router.replace('/');
      router.refresh();
      if (data?.message) toast.success(data.message);
      return data?.message ?? null;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      signIn,
      signOut,
      hasPermission: (permission) =>
        hasPermission(user?.permissions, permission),
    }),
    [user, isLoading, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
