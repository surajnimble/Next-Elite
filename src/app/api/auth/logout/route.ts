import { clearSessionCookie, getSession } from '@/features/auth/server/session';
import { isApiSuccess, logout } from '@/libs/api';
import { NextResponse } from 'next/server';

export async function POST() {
  const session = await getSession();

  // The backend's /auth/logout sits behind `authenticate`, so an expired or
  // revoked token answers 401 and nothing is revoked server-side. Clear the
  // local session regardless — the user must still end up logged out.
  const result = await logout({ token: session?.accessToken });

  await clearSessionCookie();

  return NextResponse.json({
    ok: true,
    message: isApiSuccess(result) ? result.message : null,
    code: isApiSuccess(result) ? undefined : result.code,
  });
}
