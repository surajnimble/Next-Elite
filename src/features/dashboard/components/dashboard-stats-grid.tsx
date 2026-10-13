'use client';

import { Icon, type IconName } from '@/components/icons/app-icons';
import { StatCard } from '@/components/ui/stat-card';
import { useLocale, useTranslations } from 'next-intl';
import type { DashboardStats } from '../types';

interface StatMeta {
  key: keyof DashboardStats;
  icon: IconName;
}

const STATS = [
  { key: 'totalUsers', icon: 'users' },
  { key: 'totalVendors', icon: 'storefront' },
  { key: 'pendingVendors', icon: 'clock' },
  { key: 'totalProducts', icon: 'package' },
  { key: 'totalOrders', icon: 'cart' },
  { key: 'revenue30d', icon: 'currency' },
  { key: 'openTickets', icon: 'ticket' },
  { key: 'pendingReturns', icon: 'returns' },
  { key: 'pendingRefunds', icon: 'refund' },
] as const satisfies readonly StatMeta[];

/** Number of metric cards, used for the loading skeleton. */
const STAT_COUNT = STATS.length;

interface DashboardStatsGridProps {
  stats: DashboardStats;
}

export function DashboardStatsGrid({ stats }: DashboardStatsGridProps) {
  const t = useTranslations('dashboard.stats');
  const locale = useLocale();

  const counts = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
  const amounts = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {STATS.map(({ key, icon }) => (
        <StatCard
          key={key}
          title={t(key)}
          value={(key === 'revenue30d' ? amounts : counts).format(stats[key])}
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

/** Placeholder shown while the dashboard stats are loading. */
export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: STAT_COUNT }, (_, index) => (
        <StatCard key={index} title="" value="" isLoading />
      ))}
    </div>
  );
}
