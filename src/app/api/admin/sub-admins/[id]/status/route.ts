import { getSession } from '@/features/auth/server/session';
import { isApiSuccess, toggleSubAdminStatus } from '@/libs/api';
import type { ToggleSubAdminStatusRequest } from '@/libs/models';
import { NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * The route validates with the backend's `toggleFeatureSchema`, and the
 * controller reads `req.body.enabled` — so the wire shape is `{ key, enabled }`,
 * **not** `{ isActive }`. Sending the latter is a 400.
 */
const bodySchema = z.object({
  key: z.string().trim().min(2).max(120),
  enabled: z.boolean(),
});

/** `PATCH /api/admin/sub-admins/:id/status` — activate or suspend a sub-admin. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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

  const { id } = await params;
  const payload: ToggleSubAdminStatusRequest = parsed.data;

  const result = await toggleSubAdminStatus(id, payload, {
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
