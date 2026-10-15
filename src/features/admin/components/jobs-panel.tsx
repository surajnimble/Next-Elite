'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMutation } from '@tanstack/react-query';
import type { CronJob, FailedJobListResult } from '@/libs/models';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface JobsPanelProps {
  cron: CronJob[] | null;
  cronError?: string;
  failed: FailedJobListResult | null;
  failedError?: string;
  canManage: boolean;
}

const JOB_STATUS_VARIANT: Record<
  string,
  'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive'
> = {
  PENDING: 'warning',
  RESOLVED: 'success',
  ABANDONED: 'destructive',
  FAILED: 'destructive',
};

export function JobsPanel({
  cron,
  cronError,
  failed,
  failedError,
  canManage,
}: JobsPanelProps) {
  const t = useTranslations('admin');
  const locale = useLocale();
  const router = useRouter();

  const dateFormat = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const act = useMutation({
    mutationFn: async ({
      method,
      body,
    }: {
      method: 'POST' | 'PATCH' | 'DELETE';
      body: Record<string, unknown>;
    }) => {
      const response = await fetch('/api/admin/jobs', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(payload.message || t('actionFailed'));
      }
      return payload;
    },
    onSuccess: (_data, variables) => {
      const { method, body } = variables;

      if (method === 'POST') {
        toast.success(
          body.flush ? t('jobs.cacheCleared') : t('jobs.triggered'),
        );
      } else if (body.action === 'retry') {
        toast.success(t('jobs.retried'));
      } else if (body.action === 'resolve') {
        toast.success(t('jobs.resolved'));
      } else {
        toast.success(t('jobs.deleted'));
      }

      router.refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const counts = failed?.countsData;

  return (
    <div className="flex flex-col gap-4">
      <Card variant="glow">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1.5">
              <CardTitle>{t('cron.title')}</CardTitle>
              <CardDescription>
                {cron
                  ? t('cron.description', { count: cron.length })
                  : t('cron.description')}
              </CardDescription>
            </div>

            {canManage ? (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={act.isPending}
                  onClick={() =>
                    act.mutate({ method: 'POST', body: { flush: true } })
                  }
                >
                  {t('jobs.clearCache')}
                </Button>
              </div>
            ) : null}
          </div>
        </CardHeader>

        <CardContent className="px-6">
          {cronError ? (
            <p className="py-6 text-sm text-muted-foreground">{cronError}</p>
          ) : !cron ? (
            <p className="py-6 text-sm text-muted-foreground">
              {t('cron.unavailable')}
            </p>
          ) : cron.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">
              {t('cron.empty')}
            </p>
          ) : (
            <ul className="divide-y divide-border/40">
              {cron.map((job) => (
                <li
                  key={job.name}
                  className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-sm font-medium text-foreground">
                      {job.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {job.description}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <code className="rounded bg-muted px-2 py-1 font-mono text-xs">
                      {job.cron}
                    </code>
                    <Badge variant="outline">{job.queue}</Badge>
                    <Badge variant={job.isRegistered ? 'success' : 'secondary'}>
                      {job.isRegistered
                        ? t('cron.registered')
                        : t('cron.unregistered')}
                    </Badge>

                    {canManage ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={act.isPending}
                        onClick={() =>
                          act.mutate({
                            method: 'POST',
                            body: { name: job.name },
                          })
                        }
                      >
                        {t('jobs.run')}
                      </Button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card variant="glow">
        <CardHeader>
          <CardTitle>{t('failed.title')}</CardTitle>
          <CardDescription>
            {counts
              ? t('failed.description', {
                  pending: counts.pendingCount,
                  resolved: counts.resolvedCount,
                  abandoned: counts.abandonedCount,
                })
              : t('failed.descriptionFallback')}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6">
          {failedError ? (
            <p className="py-6 text-sm text-muted-foreground">{failedError}</p>
          ) : !failed ? (
            <p className="py-6 text-sm text-muted-foreground">
              {t('failed.unavailable')}
            </p>
          ) : failed.failedJobList.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">
              {t('failed.empty')}
            </p>
          ) : (
            <ul className="divide-y divide-border/40">
              {failed.failedJobList.map((job) => (
                <li
                  key={job.failedJobId}
                  className="flex flex-col gap-2 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-foreground">
                        {job.jobName || t('failed.unnamed')}
                      </p>
                      <Badge
                        variant={JOB_STATUS_VARIANT[job.status] ?? 'outline'}
                      >
                        {job.status || '—'}
                      </Badge>
                      <Badge variant="outline">{job.queue}</Badge>
                    </div>
                    {job.error ? (
                      <p className="line-clamp-2 font-mono text-xs text-destructive">
                        {job.error}
                      </p>
                    ) : null}
                    <p className="text-xs text-muted-foreground">
                      {t('failed.meta', {
                        attempts: job.attemptsMade,
                        replays: job.replayCount,
                        at: job.lastErrorAt
                          ? dateFormat.format(new Date(job.lastErrorAt))
                          : '—',
                      })}
                    </p>
                  </div>

                  {canManage ? (
                    <div className="flex shrink-0 items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={act.isPending}
                        onClick={() =>
                          act.mutate({
                            method: 'PATCH',
                            body: {
                              id: job.failedJobId,
                              action: 'retry',
                            },
                          })
                        }
                      >
                        {t('failed.retry')}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={act.isPending}
                        onClick={() =>
                          act.mutate({
                            method: 'PATCH',
                            body: {
                              id: job.failedJobId,
                              action: 'resolve',
                            },
                          })
                        }
                      >
                        {t('failed.resolve')}
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={act.isPending}
                          >
                            {t('failed.more')}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={() =>
                              act.mutate({
                                method: 'DELETE',
                                body: { id: job.failedJobId },
                              })
                            }
                          >
                            {t('failed.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
