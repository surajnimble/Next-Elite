'use client';

import { Icon, type IconName } from '@/components/icons/app-icons';
import { StatCard } from '@/components/ui/stat-card';
import { useLocale, useTranslations } from 'next-intl';

export interface ProductMetrics {
  total: number;
  inStock: number;
  lowStock: number;
  totalValue: number;
}

interface ProductStatsProps {
  metrics: ProductMetrics;
}

/** Below this, a product with stock is flagged as low. */
const LOW_STOCK_THRESHOLD = 20;

export function ProductStats({ metrics }: ProductStatsProps) {
  const t = useTranslations();
  const locale = useLocale();

  const currency = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  });

  const items: {
    key: 'total' | 'inStock' | 'lowStock' | 'totalValue';
    icon: IconName;
    value: string;
  }[] = [
    { key: 'total', icon: 'package', value: String(metrics.total) },
    { key: 'inStock', icon: 'cart', value: String(metrics.inStock) },
    { key: 'lowStock', icon: 'clock', value: String(metrics.lowStock) },
    {
      key: 'totalValue',
      icon: 'currency',
      value: currency.format(metrics.totalValue),
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map(({ key, icon, value }) => (
        <StatCard
          key={key}
          title={t(`products.stats.${key}`)}
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

export { LOW_STOCK_THRESHOLD };
