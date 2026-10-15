import { getSession } from '@/features/auth/server/session';
import { getFeatureFlags, isApiSuccess, toggleFeature } from '@/libs/api';
import { NextResponse } from 'next/server';
import { z } from 'zod';

/** Mirrors the backend's `toggleFeatureSchema`. */
const bodySchema = z.object({
  key: z.string().trim().min(2).max(120),
  enabled: z.boolean(),
});

/**
 * `GET /api/admin/features` — every `feature.*` flag the backend knows about.
 * The flag list is never hard-coded on the client; it comes from the API.
 */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
  }

  const result = await getFeatureFlags({ token: session.accessToken });

  if (!isApiSuccess(result)) {
    return NextResponse.json(
      { message: result.message, code: result.code },
      { status: result.httpStatus >= 400 ? result.httpStatus : 502 },
    );
  }

  return NextResponse.json({ data: result.data, message: result.message });
}

/** `PATCH /api/admin/features` — flip a single flag. */
export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid request body.' },
      { status: 400 },
    );
  }

  const result = await toggleFeature(parsed.data, {
    token: session.accessToken,
  });

  if (!isApiSuccess(result)) {
    return NextResponse.json(
      { message: result.message, code: result.code },
      { status: result.httpStatus >= 400 ? result.httpStatus : 502 },
    );
  }

  return NextResponse.json({ data: result.data, message: result.message });
}
