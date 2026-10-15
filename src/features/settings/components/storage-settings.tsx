'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { STORAGE_FIELDS } from '@/features/settings/lib/setting-fields';
import {
  resolveDescription,
  resolveLabel,
} from '@/features/settings/lib/setting-fields';
import {
  resetPreferences,
  usePreferences,
} from '@/features/settings/lib/preferences';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { SettingRow, SettingRowGroup } from './setting-row';

interface StorageSettingsProps {
  values: Record<string, unknown>;
  setValue: (key: string, value: unknown) => void;
  dirtyKeys: readonly string[];
  canEdit: boolean;
}

interface StorageUsage {
  usage: number;
  quota: number;
  /** The browser exposed no StorageManager, so nothing can be shown. */
  supported: boolean;
}

/**
 * Browser-only and returns a different number on every read, so it is fetched
 * after mount — never during SSR, or React reports a hydration mismatch.
 */
function useStorageUsage(): StorageUsage {
  const [usage, setUsage] = useState<StorageUsage>({
    usage: 0,
    quota: 0,
    supported: false,
  });

  useEffect(() => {
    let cancelled = false;

    const read = async () => {
      const manager = navigator.storage;
      if (!manager?.estimate) {
        if (!cancelled) setUsage({ usage: 0, quota: 0, supported: false });
        return;
      }

      try {
        const estimate = await manager.estimate();
        if (cancelled) return;
        setUsage({
          usage: estimate.usage ?? 0,
          quota: estimate.quota ?? 0,
          supported: true,
        });
      } catch {
        if (!cancelled) setUsage({ usage: 0, quota: 0, supported: false });
      }
    };

    void read();
    return () => {
      cancelled = true;
    };
  }, []);

  return usage;
}

function formatBytes(bytes: number, locale: string): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** exponent;

  return `${new Intl.NumberFormat(locale, {
    maximumFractionDigits: value >= 100 || exponent === 0 ? 0 : 1,
  }).format(value)} ${units[exponent]}`;
}

export function StorageSettings({
  values,
  setValue,
  dirtyKeys,
  canEdit,
}: StorageSettingsProps) {
  const t = useTranslations();
  const locale = useLocale();
  const usage = useStorageUsage();
  const preferences = usePreferences()[0];

  const percent =
    usage.quota > 0
      ? Math.min(Math.round((usage.usage / usage.quota) * 100), 100)
      : 0;

  const cartField = STORAGE_FIELDS[0];

  return (
    <div className="flex flex-col gap-4">
      <Card variant="glow">
        <CardHeader>
          <CardTitle>{t('settings.storage.usage.title')}</CardTitle>
          <CardDescription>
            {t('settings.storage.usage.description')}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6">
          {usage.supported ? (
            <SettingRowGroup>
              <div className="space-y-2 py-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {formatBytes(usage.usage, locale)}
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {t('settings.storage.ofTotal', {
                      total: formatBytes(usage.quota, locale),
                      percent,
                    })}
                  </span>
                </div>
                <Progress
                  value={percent}
                  aria-label={t('settings.storage.usage.title')}
                />
              </div>

              <SettingRow
                label={t('settings.storage.local.title')}
                description={t('settings.storage.local.description')}
              >
                <span className="text-sm text-foreground tabular-nums">
                  {t('settings.storage.items', {
                    count: Object.keys(preferences).length,
                  })}
                </span>
              </SettingRow>

              <SettingRow
                label={t('settings.storage.clear.title')}
                description={t('settings.storage.clear.description')}
              >
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    resetPreferences();
                    toast.success(t('settings.storage.clear.done'));
                  }}
                >
                  {t('settings.storage.clear.action')}
                </Button>
              </SettingRow>
            </SettingRowGroup>
          ) : (
            <p className="py-6 text-sm text-muted-foreground">
              {t('settings.storage.unsupported')}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Platform-level cart persistence is admin-managed; a regular user has
          nothing to change here, so the card is hidden rather than dead. */}
      {cartField && canEdit ? (
        <Card variant="glow">
          <CardHeader>
            <CardTitle>{t('settings.storage.data.title')}</CardTitle>
            <CardDescription>
              {t('settings.storage.data.description')}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6">
            <SettingRow
              label={resolveLabel(cartField, t)}
              description={resolveDescription(cartField, t)}
              disabled={!canEdit}
            >
              <Switch
                checked={values[cartField.key] === true}
                disabled={!canEdit}
                onCheckedChange={(checked) => setValue(cartField.key, checked)}
                aria-label={resolveLabel(cartField, t)}
                className={
                  dirtyKeys.includes(cartField.key)
                    ? 'ring-2 ring-primary/40'
                    : undefined
                }
              />
            </SettingRow>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
