import { getSession } from '@/features/auth/server/session';
import {
  createApiKey,
  deleteApiKey,
  getApiKeys,
  isApiSuccess,
  revokeApiKey,
} from '@/libs/api';
import { NextResponse } from 'next/server';
import { z } from 'zod';

/** Mirrors the backend's `createApiKeySchema`. */
const createSchema = z.object({
  name: z.string().trim().min(2).max(120),
  scopes: z.array(z.string().trim().max(60)).max(50).optional(),
  expiresInDays: z.coerce.number().int().min(1).max(3650).optional(),
});

const idSchema = z.object({ id: z.string().trim().min(2).max(64) });

/** `GET /api/admin/api-keys` — any admin can list. */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
  }

  const result = await getApiKeys({ token: session.accessToken });

  if (!isApiSuccess(result)) {
    return NextResponse.json(
      { message: result.message, code: result.code },
      { status: result.httpStatus >= 400 ? result.httpStatus : 502 },
    );
  }

  return NextResponse.json({ data: result.data, message: result.message });
}

/**
 * `POST /api/admin/api-keys` — super admin. The plaintext key is returned in
 * this response only; the backend stores a hash, so it cannot be shown again.
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

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid request body.' },
      { status: 400 },
    );
  }

  const result = await createApiKey(parsed.data, {
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

/** `PATCH /api/admin/api-keys` — `{ id, action: 'revoke' | 'delete' }`. */
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

  const parsed = z
    .object({ id: idSchema.shape.id, action: z.enum(['revoke', 'delete']) })
    .safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid request body.' },
      { status: 400 },
    );
  }

  // Revoking is open to any admin; deleting is super-admin-only server-side.
  const result =
    parsed.data.action === 'revoke'
      ? await revokeApiKey(parsed.data.id, { token: session.accessToken })
      : await deleteApiKey(parsed.data.id, { token: session.accessToken });

  if (!isApiSuccess(result)) {
    return NextResponse.json(
      { message: result.message, code: result.code },
      { status: result.httpStatus >= 400 ? result.httpStatus : 502 },
    );
  }

  return NextResponse.json({ data: result.data, message: result.message });
}
