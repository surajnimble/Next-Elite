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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AuditLogItem, PaginatedResult } from '@/libs/models';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const ALL = 'all';

interface AuditLogTableProps {
  logs: AuditLogItem[];
  pagination: PaginatedResult;
  action: string;
  from: string;
  to: string;
  /** Distinct `action` values the current page returned, for the filter. */
  actions: string[];
}

/** `SUPER_ADMIN` → `Super admin`. */
function humanize(value: string): string {
  if (!value) return '—';

  return value
    .split(/[_.:\-\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ');
}

const ACTION_VARIANT: Record<
  string,
  'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive'
> = {
  CREATE: 'success',
  UPDATE: 'default',
  DELETE: 'destructive',
  SUSPEND: 'warning',
  ACTIVATE: 'success',
  APPROVE: 'success',
  REJECT: 'destructive',
};

export function AuditLogTable({
  logs,
  pagination,
  action,
  from,
  to,
  actions,
}: AuditLogTableProps) {
  const t = useTranslations('admin');
  const locale = useLocale();
  const router = useRouter();

  const [actionInput, setActionInput] = useState(action);

  const dateFormat = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'medium',
  });

  function setAction(next: string) {
    setActionInput(next === ALL ? '' : next);

    const params = new URLSearchParams();
    if (next !== ALL) params.set('action', next);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const query = params.toString();
    router.push(query ? `/admins?${query}` : '/admins');
  }

  const goToPage = (next: number) => {
    const params = new URLSearchParams();
    if (action) params.set('action', action);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    if (next > 1) params.set('page', String(next));
    const query = params.toString();
    router.push(query ? `/admins?${query}` : '/admins');
  };

  const rowFrom = logs.length
    ? (pagination.currentPage - 1) * pagination.limit + 1
    : 0;
  const rowTo = rowFrom + logs.length - 1;

  return (
    <Card variant="glow">
      <CardHeader>
        <CardTitle>{t('audit.title')}</CardTitle>
        <CardDescription>
          {t('audit.description', { total: pagination.totalRecord })}
        </CardDescription>

        {/* Options come from the `action` values the API just returned, so the
            filter never offers a value the backend does not accept. */}
        {actions.length > 1 ? (
          <div className="mt-4 flex items-center gap-2">
            <Select value={actionInput || ALL} onValueChange={setAction}>
              <SelectTrigger className="w-48" aria-label={t('audit.action')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>{t('audit.actionAll')}</SelectItem>
                {actions.map((value) => (
                  <SelectItem key={value} value={value}>
                    {humanize(value)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </CardHeader>

      <CardContent>
        {logs.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            {t('audit.empty')}
          </p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('audit.when')}</TableHead>
                  <TableHead>{t('audit.actor')}</TableHead>
                  <TableHead>{t('audit.action')}</TableHead>
                  <TableHead>{t('audit.entity')}</TableHead>
                  <TableHead>{t('audit.detail')}</TableHead>
                  <TableHead>{t('audit.ip')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.auditLogId}>
                    <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                      {log.createdAt
                        ? dateFormat.format(new Date(log.createdAt))
                        : '—'}
                    </TableCell>

                    <TableCell>
                      <p className="truncate text-sm font-medium text-foreground">
                        {log.actorData?.name || t('audit.system')}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {log.actorData?.email || humanize(log.actorRole)}
                      </p>
                    </TableCell>

                    <TableCell>
                      <Badge variant={ACTION_VARIANT[log.action] ?? 'outline'}>
                        {humanize(log.action)}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <p className="text-sm text-foreground">
                        {humanize(log.entity)}
                      </p>
                      {log.entityId ? (
                        <code className="font-mono text-xs text-muted-foreground">
                          {log.entityId}
                        </code>
                      ) : null}
                    </TableCell>

                    <TableCell className="max-w-64 truncate text-sm text-muted-foreground">
                      {log.description || '—'}
                    </TableCell>

                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {log.ip || '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                {t('audit.showing', {
                  from: rowFrom,
                  to: rowTo,
                  total: pagination.totalRecord,
                })}
              </p>

              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasPrevious}
                  onClick={() => goToPage(pagination.previousPage || 1)}
                >
                  {t('team.previous')}
                </Button>
                <span className="px-2 text-xs text-muted-foreground tabular-nums">
                  {pagination.currentPage} / {Math.max(pagination.totalPage, 1)}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasNext}
                  onClick={() => goToPage(pagination.nextPage)}
                >
                  {t('team.next')}
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
