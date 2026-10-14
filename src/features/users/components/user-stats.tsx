'use client';

import { Icon, type IconName } from '@/components/icons/app-icons';
import { StatCard } from '@/components/ui/stat-card';
import { useTranslations } from 'next-intl';

export interface UserMetrics {
  total: number;
  active: number;
  newThisMonth: number;
  activeRate: number;
}

interface UserStatsProps {
  metrics: UserMetrics;
}

export function UserStats({ metrics }: UserStatsProps) {
  const t = useTranslations();

  const items: {
    key: 'total' | 'active' | 'newThisMonth' | 'activeRate';
    icon: IconName;
    value: string;
  }[] = [
    { key: 'total', icon: 'users', value: String(metrics.total) },
    { key: 'active', icon: 'user', value: String(metrics.active) },
    { key: 'newThisMonth', icon: 'chart', value: String(metrics.newThisMonth) },
    { key: 'activeRate', icon: 'dashboard', value: `${metrics.activeRate}%` },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map(({ key, icon, value }) => (
        <StatCard
          key={key}
          title={t(`users.stats.${key}`)}
          growthRate=""
          value={value}
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
