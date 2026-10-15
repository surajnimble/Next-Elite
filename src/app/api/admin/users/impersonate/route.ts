import { getSession } from '@/features/auth/server/session';
import { impersonateUser, isApiSuccess } from '@/libs/api';
import { NextResponse } from 'next/server';
import { z } from 'zod';

/** Mirrors the backend's `impersonateSchema` — `reason` is mandatory. */
const bodySchema = z.object({
  reason: z.string().trim().min(1).max(500),
  durationMin: z.coerce.number().int().min(1).max(480).optional(),
});

/**
 * `POST /api/admin/users/impersonate` — super admin only.
 *
 * `{ userId }` in the body becomes the `:id` path segment. The backend writes
 * every impersonation to AuditLog, including who did it and why.
 */
export async function POST(request: Request) {
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

  const parsed = z
    .object({
      userId: z.string().trim().min(2).max(64),
      reason: bodySchema.shape.reason,
      durationMin: bodySchema.shape.durationMin,
    })
    .safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid request body.' },
      { status: 400 },
    );
  }

  const { userId, reason, durationMin } = parsed.data;

  const result = await impersonateUser(
    userId,
    { reason, durationMin },
    { token: session.accessToken },
  );

  if (!isApiSuccess(result)) {
    return NextResponse.json(
      { message: result.message, code: result.code },
      { status: result.httpStatus >= 400 ? result.httpStatus : 502 },
    );
  }

  return NextResponse.json({ data: result.data, message: result.message });
}
