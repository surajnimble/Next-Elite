'use client';

import { Icon, type IconName } from '@/components/icons/app-icons';
import { StatCard } from '@/components/ui/stat-card';
import { useLocale, useTranslations } from 'next-intl';

export interface DashboardMetric {
  key: 'totalUsers' | 'revenue30d' | 'totalOrders' | 'openTickets';
  icon: IconName;
  value: number;
}

interface DashboardStatsGridProps {
  metrics: DashboardMetric[];
}

export function DashboardStatsGrid({ metrics }: DashboardStatsGridProps) {
  const t = useTranslations();
  const locale = useLocale();

  const integer = new Intl.NumberFormat(locale);
  const currency = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  });

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {metrics.map(({ key, icon, value }) => (
        <StatCard
          key={key}
          title={t(`dashboard.admin.metrics.${key}`)}
          growthRate=""
          value={
            key === 'revenue30d'
              ? currency.format(value)
              : integer.format(value)
          }
          icon={
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon name={icon} className="size-5" weight="fill" />
            </span>
          }
        />
      ))}
    </div>
  );
}
