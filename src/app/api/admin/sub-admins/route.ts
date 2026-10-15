import { getSession } from '@/features/auth/server/session';
import { createSubAdmin, getSubAdmins, isApiSuccess } from '@/libs/api';
import type { SettingsListQuery } from '@/libs/models';
import { NextResponse } from 'next/server';
import { z } from 'zod';

/** Mirrors the backend's `createSubAdminSchema`. */
const createSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  phone: z.string().trim().max(15).optional(),
  password: z.string().min(8).max(64),
  permissions: z.array(z.string().trim().max(60)).max(100).optional(),
});

const querySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

/** `GET /api/admin/sub-admins` — the sub-admin list. */
export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
  }

  const url = new URL(request.url);
  const parsed = querySchema.safeParse(
    Object.fromEntries(url.searchParams.entries()),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid query parameters.' },
      { status: 400 },
    );
  }

  const query: SettingsListQuery = parsed.data;
  const result = await getSubAdmins(query, { token: session.accessToken });

  if (!isApiSuccess(result)) {
    return NextResponse.json(
      { message: result.message, code: result.code },
      { status: result.httpStatus >= 400 ? result.httpStatus : 502 },
    );
  }

  return NextResponse.json({ data: result.data, message: result.message });
}

/** `POST /api/admin/sub-admins` — create a sub-admin (super admin only). */
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

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid request body.' },
      { status: 400 },
    );
  }

  const result = await createSubAdmin(parsed.data, {
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
