'use client';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { CronJob, SystemHealthResult } from '@/libs/models';
import { useLocale, useTranslations } from 'next-intl';

interface SystemPanelProps {
  health: SystemHealthResult | null;
  cron: CronJob[] | null;
  /** Set when the super-admin-only cron endpoint was refused. */
  cronError?: string;
}

function formatUptime(seconds: number, locale: string): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '—';

  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3_600);
  const minutes = Math.floor((seconds % 3_600) / 60);

  const parts: string[] = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes || parts.length === 0) parts.push(`${minutes}m`);

  return (
    new Intl.NumberFormat(locale).format(days) + ' ' + parts.slice(1).join(' ')
  );
}

export function SystemPanel({ health, cron, cronError }: SystemPanelProps) {
  const t = useTranslations('admin');
  const locale = useLocale();

  const dateFormat = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'medium',
  });

  return (
    <div className="flex flex-col gap-4">
      <Card variant="glow">
        <CardHeader>
          <CardTitle>{t('system.title')}</CardTitle>
          <CardDescription>{t('system.description')}</CardDescription>
        </CardHeader>

        <CardContent className="px-6">
          {!health ? (
            <p className="py-6 text-sm text-muted-foreground">
              {t('system.unavailable')}
            </p>
          ) : (
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <dt className="text-xs text-muted-foreground">
                  {t('system.status')}
                </dt>
                <dd className="mt-1">
                  <Badge
                    variant={
                      health.status === 'healthy' ? 'success' : 'warning'
                    }
                  >
                    {health.status}
                  </Badge>
                </dd>
              </div>

              <div>
                <dt className="text-xs text-muted-foreground">
                  {t('system.database')}
                </dt>
                <dd className="mt-1 flex items-center gap-2 text-sm">
                  <Badge
                    variant={health.database?.ok ? 'success' : 'destructive'}
                  >
                    {health.database?.ok ? t('system.up') : t('system.down')}
                  </Badge>
                  <span className="text-muted-foreground tabular-nums">
                    {health.database?.latencyMs ?? 0} ms
                  </span>
                </dd>
              </div>

              <div>
                <dt className="text-xs text-muted-foreground">
                  {t('system.uptime')}
                </dt>
                <dd className="mt-1 text-sm tabular-nums">
                  {formatUptime(health.uptimeSeconds, locale)}
                </dd>
              </div>

              <div>
                <dt className="text-xs text-muted-foreground">
                  {t('system.memory')}
                </dt>
                <dd className="mt-1 text-sm tabular-nums">
                  {health.memoryMb} MB
                </dd>
              </div>

              <div>
                <dt className="text-xs text-muted-foreground">
                  {t('system.node')}
                </dt>
                <dd className="mt-1 font-mono text-sm">{health.nodeVersion}</dd>
              </div>

              <div>
                <dt className="text-xs text-muted-foreground">
                  {t('system.checked')}
                </dt>
                <dd className="mt-1 text-sm">
                  {health.checkedAt
                    ? dateFormat.format(new Date(health.checkedAt))
                    : '—'}
                </dd>
              </div>
            </dl>
          )}
        </CardContent>
      </Card>

      <Card variant="glow">
        <CardHeader>
          <CardTitle>{t('cron.title')}</CardTitle>
          <CardDescription>
            {cron
              ? t('cron.description', { count: cron.length })
              : t('cron.description')}
          </CardDescription>
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
                  className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
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
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
