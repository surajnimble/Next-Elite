'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useMutation } from '@tanstack/react-query';
import type { MaintenanceStatus } from '@/libs/models';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface MaintenancePanelProps {
  status: MaintenanceStatus | null;
  canManage: boolean;
  /** Set when the super-admin-only read was refused. */
  error?: string;
}

/**
 * `allowedIps` goes over the wire as an array; the backend also accepts a CSV
 * string. Blank entries are dropped so a trailing comma cannot slip through.
 */
function parseIps(raw: string): string[] {
  return raw
    .split(/[\n,]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function MaintenancePanel({
  status,
  canManage,
  error,
}: MaintenancePanelProps) {
  const t = useTranslations('admin');
  const router = useRouter();

  const [enabled, setEnabled] = useState(status?.enabled ?? false);
  const [message, setMessage] = useState(status?.message ?? '');
  const [ips, setIps] = useState((status?.allowedIps ?? []).join(', '));

  const save = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/admin/maintenance', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled,
          message: message || undefined,
          allowedIps: parseIps(ips),
        }),
      });
      const payload = (await response.json()) as {
        message?: string;
        data?: MaintenanceStatus;
      };
      if (!response.ok) {
        throw new Error(payload.message || t('actionFailed'));
      }
      return payload;
    },
    onSuccess: (payload) => {
      const next = payload.data;
      if (next) {
        setEnabled(next.enabled);
        setMessage(next.message);
        setIps((next.allowedIps ?? []).join(', '));
      }
      toast.success(t('maintenance.saved'));
      router.refresh();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const dirty =
    enabled !== (status?.enabled ?? false) ||
    message !== (status?.message ?? '') ||
    ips !== (status?.allowedIps ?? []).join(', ');

  return (
    <Card variant="glow">
      <CardHeader>
        <CardTitle>{t('maintenance.title')}</CardTitle>
        <CardDescription>{t('maintenance.description')}</CardDescription>
      </CardHeader>

      <CardContent className="px-6">
        {error || !status ? (
          <p className="py-4 text-sm text-muted-foreground">
            {error || t('maintenance.unavailable')}
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <Label htmlFor="maintenance-toggle">
                  {t('maintenance.enable')}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t('maintenance.enableHint')}
                </p>
              </div>
              <Switch
                id="maintenance-toggle"
                checked={enabled}
                disabled={!canManage || save.isPending}
                onCheckedChange={setEnabled}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="maintenance-message">
                {t('maintenance.message')}
              </Label>
              <Input
                id="maintenance-message"
                value={message}
                maxLength={300}
                disabled={!canManage}
                placeholder={t('maintenance.messagePlaceholder')}
                onChange={(event) => setMessage(event.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="maintenance-ips">
                {t('maintenance.allowedIps')}
              </Label>
              <Input
                id="maintenance-ips"
                value={ips}
                disabled={!canManage}
                placeholder={t('maintenance.allowedIpsPlaceholder')}
                onChange={(event) => setIps(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {t('maintenance.allowedIpsHint')}
              </p>
            </div>

            {canManage ? (
              <div>
                <Button
                  type="button"
                  size="sm"
                  disabled={!dirty || save.isPending}
                  onClick={() => save.mutate()}
                >
                  {save.isPending ? t('saving') : t('maintenance.save')}
                </Button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                {t('readOnlyNotice')}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
