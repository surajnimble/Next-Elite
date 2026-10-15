import { getSession } from '@/features/auth/server/session';
import {
  clearCache,
  deleteFailedJob,
  getFailedJobs,
  isApiSuccess,
  resolveFailedJob,
  retryFailedJob,
  triggerJob,
} from '@/libs/api';
import type { FailedJobQuery } from '@/libs/models';
import { NextResponse } from 'next/server';
import { z } from 'zod';

/** Mirrors the backend's `triggerJobSchema`: `{ name }`. */
const triggerNameSchema = z.object({
  name: z.string().trim().min(2).max(60),
});

/** Mirrors the backend's `listFailedJobsSchema`. */
const querySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  status: z.string().trim().max(40).optional(),
  queue: z.string().trim().max(40).optional(),
  jobName: z.string().trim().max(60).optional(),
});

/** `GET /api/admin/jobs` — registered cron jobs plus the failed-job queue. */
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

  const query: FailedJobQuery = parsed.data;
  const result = await getFailedJobs(query, { token: session.accessToken });

  if (!isApiSuccess(result)) {
    return NextResponse.json(
      { message: result.message, code: result.code },
      { status: result.httpStatus >= 400 ? result.httpStatus : 502 },
    );
  }

  return NextResponse.json({ data: result.data, message: result.message });
}

/** `POST /api/admin/jobs` — `{ name }` to run a job, or `{ flush: true }` to clear cache. */
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

  // Two shapes share this endpoint: `{ flush: true }` clears the cache,
  // otherwise the body must name a registered job.
  const flush = z.object({ flush: z.literal(true) }).safeParse(body);
  const trigger = flush.success ? null : triggerNameSchema.safeParse(body);

  if (!flush.success && !trigger?.success) {
    return NextResponse.json(
      { message: 'Provide a job name, or flush: true.' },
      { status: 400 },
    );
  }

  const result = flush.success
    ? await clearCache({ token: session.accessToken })
    : await triggerJob(
        {
          name: (trigger as { data: z.infer<typeof triggerNameSchema> }).data
            .name,
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

/**
 * `PATCH /api/admin/jobs` — `{ id, action: 'retry' | 'resolve' }` on a failed job.
 * Both endpoints are super-admin-only.
 */
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
    .object({
      id: z.string().trim().min(2).max(64),
      action: z.enum(['retry', 'resolve']),
    })
    .safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid request body.' },
      { status: 400 },
    );
  }

  const { id, action } = parsed.data;
  const result =
    action === 'retry'
      ? await retryFailedJob(id, { token: session.accessToken })
      : await resolveFailedJob(id, { token: session.accessToken });

  if (!isApiSuccess(result)) {
    return NextResponse.json(
      { message: result.message, code: result.code },
      { status: result.httpStatus >= 400 ? result.httpStatus : 502 },
    );
  }

  return NextResponse.json({ data: result.data, message: result.message });
}

/** `DELETE /api/admin/jobs` — `{ id }` drops a failed job from the queue. */
export async function DELETE(request: Request) {
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
    .object({ id: z.string().trim().min(2).max(64) })
    .safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid request body.' },
      { status: 400 },
    );
  }

  const result = await deleteFailedJob(parsed.data.id, {
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
