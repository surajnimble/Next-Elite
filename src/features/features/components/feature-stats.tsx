'use client';

import { Icon, type IconName } from '@/components/icons/app-icons';
import { StatCard } from '@/components/ui/stat-card';
import { useTranslations } from 'next-intl';
import type { FlagSummary } from '@/features/features/lib/feature-flags';

interface FeatureStatsProps {
  summary: FlagSummary;
}

/**
 * `StatCard` uses `useRipple()`, so it has to live under a `'use client'`
 * boundary — same as `dashboard-stats-grid` and `product-stats`.
 */
export function FeatureStats({ summary }: FeatureStatsProps) {
  const t = useTranslations('features');

  const items: {
    key: 'total' | 'enabled' | 'disabled';
    icon: IconName;
    value: number;
  }[] = [
    { key: 'total', icon: 'kanban', value: summary.total },
    { key: 'enabled', icon: 'ticket', value: summary.enabled },
    { key: 'disabled', icon: 'close', value: summary.disabled },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <StatCard
          key={item.key}
          title={t(`stats.${item.key}`)}
          growthRate=""
          value={String(item.value)}
          icon={
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon name={item.icon} className="size-5" weight="fill" />
            </span>
          }
        />
      ))}
    </div>
  );
}
