import { getSession } from '@/features/auth/server/session';
import { isApiSuccess, toggleUserStatus } from '@/libs/api';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const bodySchema = z.object({
  isActive: z.boolean(),
  reason: z.string().max(500).optional(),
});

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
  const result = await toggleUserStatus(id, parsed.data, {
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
