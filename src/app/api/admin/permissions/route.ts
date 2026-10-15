import { getSession } from '@/features/auth/server/session';
import { getPermissions, isApiSuccess, setPermissions } from '@/libs/api';
import { NextResponse } from 'next/server';
import { z } from 'zod';

/** Mirrors the backend's `setPermissionsSchema`. */
const bodySchema = z.object({
  role: z.string().trim().min(2).max(60),
  permissions: z.array(z.string().trim().max(60)).max(200),
});

/** `GET /api/admin/permissions` — every role and what it can do. */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
  }

  const result = await getPermissions({ token: session.accessToken });

  if (!isApiSuccess(result)) {
    return NextResponse.json(
      { message: result.message, code: result.code },
      { status: result.httpStatus >= 400 ? result.httpStatus : 502 },
    );
  }

  return NextResponse.json({ data: result.data, message: result.message });
}

/** `PUT /api/admin/permissions` — replace one role's permission set. */
export async function PUT(request: Request) {
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

  const { role, permissions } = parsed.data;
  const result = await setPermissions(
    role,
    { permissions },
    {
      token: session.accessToken,
    },
  );

  if (!isApiSuccess(result)) {
    return NextResponse.json(
      { message: result.message, code: result.code },
      { status: result.httpStatus >= 400 ? result.httpStatus : 502 },
    );
  }

  return NextResponse.json({ data: result.data, message: result.message });
}
