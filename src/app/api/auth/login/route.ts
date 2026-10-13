import { ApiError, loginWithApi } from '@/features/auth/server/api';
import {
  createSession,
  setSessionCookie,
} from '@/features/auth/server/session';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const deviceDataSchema = z.object({
  deviceId: z.string().min(1),
  platform: z.string().min(1),
  appVersion: z.string().min(1),
  model: z.string().min(1),
  locale: z.string().min(1),
  timezone: z.string().min(1),
});

const loginRequestSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
  phone: z.string().optional(),
  deviceData: deviceDataSchema.optional(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const parsed = loginRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid login request.' },
      { status: 400 },
    );
  }

  try {
    const { message, result } = await loginWithApi(parsed.data);

    if (result.twoFactorRequired) {
      return NextResponse.json(
        { message, twoFactorRequired: true },
        { status: 403 },
      );
    }

    const { session, maxAge } = createSession(
      result.userData,
      result.accessToken,
      result.expiresIn,
      result.rolesList,
    );
    await setSessionCookie(session, maxAge);

    return NextResponse.json({ user: session.user, message });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status >= 400 ? error.status : 401 },
      );
    }

    return NextResponse.json(
      { message: 'Unable to sign in right now. Please try again.' },
      { status: 502 },
    );
  }
}
