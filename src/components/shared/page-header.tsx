'use client';

import { Icon } from '@/components/icons/app-icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/libs/utils';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTransition, type ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
  /** Shows a refresh button that re-runs the server render for this route. */
  showRefresh?: boolean;
  /** Override the default `router.refresh()`. Client-side handler only. */
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function PageHeader({
  title,
  subtitle,
  actions,
  className,
  showRefresh = false,
  onRefresh,
  refreshing = false,
}: PageHeaderProps) {
  const t = useTranslations('common');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
      return;
    }
    startTransition(() => router.refresh());
  };

  const busy = refreshing || isPending;

  return (
    <div
      className={cn(
        'flex w-full min-w-0 shrink-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0 space-y-0.5">
        <h1 className="font-sans text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="max-w-2xl font-sans text-xs text-muted-foreground sm:text-sm">
            {subtitle}
          </p>
        ) : null}
      </div>

      {actions || showRefresh ? (
        <div className="flex shrink-0 items-center gap-2">
          {actions}
          {showRefresh ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              title={t('refresh')}
              aria-label={t('refresh')}
              onClick={handleRefresh}
              disabled={busy}
            >
              <Icon
                name="refresh"
                className={cn('size-4', busy && 'animate-spin')}
              />
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  centered?: boolean;
}

export function PageLayout({
  children,
  className,
  centered = false,
}: PageLayoutProps) {
  return (
    <div
      className={cn(
        'flex w-full min-w-0 flex-col gap-6',
        centered &&
          'min-h-[calc(100dvh-var(--app-header-height))] justify-center',
        className,
      )}
    >
      {children}
    </div>
  );
}
