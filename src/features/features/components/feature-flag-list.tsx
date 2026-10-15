'use client';

import { Icon } from '@/components/icons/app-icons';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toFlagList } from '@/features/features/lib/feature-flags';
import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

interface FeatureFlagListProps {
  /** The raw `feature.*` → boolean map the API returned. */
  flags: Record<string, boolean>;
  canEdit: boolean;
}

export function FeatureFlagList({ flags, canEdit }: FeatureFlagListProps) {
  const t = useTranslations('features');
  const router = useRouter();
  const [term, setTerm] = useState('');

  const toggle = useMutation({
    mutationFn: async ({ key, enabled }: { key: string; enabled: boolean }) => {
      const response = await fetch('/api/admin/features', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, enabled }),
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(payload.message || t('actionFailed'));
      }
      return payload;
    },
    onSuccess: () => {
      toast.success(t('updated'));
      router.refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const all = useMemo(() => toFlagList(flags), [flags]);

  const visible = useMemo(() => {
    const needle = term.trim().toLowerCase();
    if (!needle) return all;

    return all.filter(
      (flag) =>
        flag.name.toLowerCase().includes(needle) ||
        flag.key.toLowerCase().includes(needle),
    );
  }, [all, term]);

  return (
    <Card variant="glow">
      <CardContent className="px-6">
        <div className="relative mb-4">
          <Icon
            name="search"
            className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder={t('searchPlaceholder')}
            aria-label={t('searchLabel')}
            className="ps-9"
          />
        </div>

        {visible.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {t('empty')}
          </p>
        ) : (
          <>
            <p className="mb-3 text-xs text-muted-foreground tabular-nums">
              {t('showing', { count: visible.length, total: all.length })}
            </p>

            <ul className="divide-y divide-border/40">
              {visible.map((flag) => (
                <li
                  key={flag.key}
                  className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {flag.name}
                    </p>
                    <code className="font-mono text-xs text-muted-foreground">
                      {flag.key}
                    </code>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Badge
                      variant={flag.enabled ? 'successOutline' : 'outline'}
                    >
                      {flag.enabled ? t('enabled') : t('disabled')}
                    </Badge>
                    <Switch
                      checked={flag.enabled}
                      disabled={!canEdit || toggle.isPending}
                      onCheckedChange={(checked) =>
                        toggle.mutate({ key: flag.key, enabled: checked })
                      }
                      aria-label={flag.name}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
