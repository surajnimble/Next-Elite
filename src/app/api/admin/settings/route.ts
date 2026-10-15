import { getSession } from '@/features/auth/server/session';
import { bulkUpdateSettings, getSettings, isApiSuccess } from '@/libs/api';
import type { SettingsListQuery } from '@/libs/models';
import { NextResponse } from 'next/server';
import { z } from 'zod';

/** Mirrors the backend's `updateSettingSchema` entry shape. */
const settingSchema = z.object({
  key: z.string().trim().min(2).max(120),
  value: z.unknown(),
  category: z.string().trim().max(50).optional(),
  isPublic: z.boolean().optional(),
});

const bodySchema = z.object({
  settings: z.array(settingSchema).min(1).max(100),
});

const querySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  category: z.string().trim().max(50).optional(),
  isPublic: z.enum(['true', 'false']).optional(),
});

/** `GET /api/admin/settings` — the platform settings list for the settings UI. */
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
  const result = await getSettings(query, { token: session.accessToken });

  if (!isApiSuccess(result)) {
    return NextResponse.json(
      { message: result.message, code: result.code },
      { status: result.httpStatus >= 400 ? result.httpStatus : 502 },
    );
  }

  return NextResponse.json({ data: result.data, message: result.message });
}

/** `PATCH /api/admin/settings` — persists one or more settings in a single call. */
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

  const result = await bulkUpdateSettings(
    { settings: parsed.data.settings },
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
