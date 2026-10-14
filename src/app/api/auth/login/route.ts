import {
  createSession,
  setSessionCookie,
} from '@/features/auth/server/session';
import { login as loginRequest } from '@/libs/api';
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

  const result = await loginRequest(parsed.data);

  if (!result.ok) {
    return NextResponse.json(
      { message: result.message },
      { status: result.httpStatus >= 400 ? result.httpStatus : 401 },
    );
  }

  const { twoFactorRequired, accessToken, expiresIn, userData, rolesList } =
    result.data;

  if (twoFactorRequired) {
    return NextResponse.json(
      { message: result.message, twoFactorRequired: true },
      { status: 403 },
    );
  }

  const { session, maxAge } = createSession(
    userData,
    accessToken,
    expiresIn,
    rolesList,
  );
  await setSessionCookie(session, maxAge);

  return NextResponse.json({ user: session.user, message: result.message });
}
