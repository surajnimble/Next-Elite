import { getSession } from '@/features/auth/server/session';
import { deleteSubAdmin, isApiSuccess, updateSubAdmin } from '@/libs/api';
import { NextResponse } from 'next/server';
import { z } from 'zod';

/** Mirrors the backend's `updateSubAdminSchema` — all fields optional. */
const updateSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    phone: z.string().trim().max(15).optional(),
    permissions: z.array(z.string().trim().max(60)).max(100).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required.',
  });

/** `PATCH /api/admin/sub-admins/:id` — rename, change phone, or set permissions. */
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

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid request body.' },
      { status: 400 },
    );
  }

  const { id } = await params;
  const result = await updateSubAdmin(id, parsed.data, {
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

/** `DELETE /api/admin/sub-admins/:id` (super admin only). */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
  }

  const { id } = await params;
  const result = await deleteSubAdmin(id, { token: session.accessToken });

  if (!isApiSuccess(result)) {
    return NextResponse.json(
      { message: result.message, code: result.code },
      { status: result.httpStatus >= 400 ? result.httpStatus : 502 },
    );
  }

  return NextResponse.json({ data: result.data, message: result.message });
}
