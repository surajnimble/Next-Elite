import { logoutWithApi } from '@/features/auth/server/api';
import { clearSessionCookie, getSession } from '@/features/auth/server/session';
import { NextResponse } from 'next/server';

export async function POST() {
  const session = await getSession();

  let message: string | null = null;
  try {
    message = await logoutWithApi(session?.accessToken);
  } catch {
    // Always clear the local session, even if the backend call fails.
  }

  await clearSessionCookie();

  return NextResponse.json({ ok: true, message });
}
