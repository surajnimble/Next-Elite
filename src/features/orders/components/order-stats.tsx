'use client';

import { Icon, type IconName } from '@/components/icons/app-icons';
import { StatCard } from '@/components/ui/stat-card';
import { useLocale, useTranslations } from 'next-intl';

export interface OrderMetrics {
  total: number;
  pending: number;
  shipped: number;
  revenue: number;
}

interface OrderStatsProps {
  metrics: OrderMetrics;
}

export function OrderStats({ metrics }: OrderStatsProps) {
  const t = useTranslations();
  const locale = useLocale();

  const currency = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  });

  const items: {
    key: keyof OrderMetrics;
    icon: IconName;
    value: string;
    hint: string;
  }[] = [
    { key: 'total', icon: 'package', value: String(metrics.total), hint: '' },
    {
      key: 'pending',
      icon: 'clock',
      value: String(metrics.pending),
      hint: t('orders.stats.pendingHint'),
    },
    {
      key: 'shipped',
      icon: 'cart',
      value: String(metrics.shipped),
      hint: t('orders.stats.shippedHint'),
    },
    {
      key: 'revenue',
      icon: 'currency',
      value: currency.format(metrics.revenue),
      hint: '',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map(({ key, icon, value, hint }) => (
        <StatCard
          key={key}
          title={t(`orders.stats.${key}`)}
          growthRate={hint}
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
