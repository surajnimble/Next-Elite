import { getSession } from '@/features/auth/server/session';
import { getMaintenance, isApiSuccess, updateMaintenance } from '@/libs/api';
import { NextResponse } from 'next/server';
import { z } from 'zod';

/** Mirrors the backend's `updateMaintenanceSchema`. */
const bodySchema = z.object({
  enabled: z.boolean(),
  message: z.string().trim().max(300).optional(),
  allowedIps: z.array(z.string().trim().max(64)).max(200).optional(),
});

/** `GET /api/admin/maintenance` — current maintenance mode. */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
  }

  const result = await getMaintenance({ token: session.accessToken });

  if (!isApiSuccess(result)) {
    return NextResponse.json(
      { message: result.message, code: result.code },
      { status: result.httpStatus >= 400 ? result.httpStatus : 502 },
    );
  }

  return NextResponse.json({ data: result.data, message: result.message });
}

/** `PATCH /api/admin/maintenance` — turn maintenance mode on or off. */
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

  const result = await updateMaintenance(
    {
      enabled: parsed.data.enabled,
      message: parsed.data.message,
      // The backend coerces this to `[]` when omitted.
      allowedIps: parsed.data.allowedIps ?? [],
    },
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
