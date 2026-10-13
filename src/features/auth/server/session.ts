import 'server-only';

import { cookies } from 'next/headers';
import { cache } from 'react';
import { buildAuthUser, type ApiUserData } from '../lib/map-user';
import type { AuthUser } from '../types';

export const SESSION_COOKIE_NAME = 'next-elite.session';

/** Cookie lifetime fallback (in seconds) when the API omits `expiresIn`. */
const DEFAULT_MAX_AGE = 60 * 60; // 1 hour

export interface Session {
  accessToken: string;
  /** Absolute expiry time in epoch milliseconds. */
  expiresAt: number;
  user: AuthUser;
}

/** Builds the session payload from a successful API login response. */
export function createSession(
  userData: ApiUserData,
  accessToken: string,
  expiresIn: number,
  rolesList?: readonly string[],
): { session: Session; maxAge: number } {
  const maxAge = expiresIn > 0 ? expiresIn : DEFAULT_MAX_AGE;
  return {
    maxAge,
    session: {
      accessToken,
      expiresAt: Date.now() + maxAge * 1000,
      user: buildAuthUser(userData, rolesList),
    },
  };
}

/** Persists the session into an httpOnly cookie (route handlers only). */
export async function setSessionCookie(
  session: Session,
  maxAge: number,
): Promise<void> {
  const store = await cookies();
  store.set({
    name: SESSION_COOKIE_NAME,
    value: JSON.stringify(session),
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge,
  });
}

/** Clears the session cookie (route handlers only). */
export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
}

export const getSession = cache(async (): Promise<Session | null> => {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE_NAME)?.value;
  if (!raw) return null;

  try {
    const session = JSON.parse(raw) as Session;
    if (!session?.accessToken || !session?.user?.email) return null;
    if (session.expiresAt <= Date.now()) return null;
    return session;
  } catch {
    return null;
  }
});

export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const session = await getSession();
  return session?.user ?? null;
});
