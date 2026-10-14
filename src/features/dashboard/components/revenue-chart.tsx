'use client';

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useLocale, useTranslations } from 'next-intl';

export interface SeriesPoint {
  key: string;
  label: string;
  value: number;
}

interface RevenueChartProps {
  points: SeriesPoint[];
}

export function RevenueChart({ points }: RevenueChartProps) {
  const t = useTranslations('dashboard.admin');
  const locale = useLocale();

  const currency = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
  const peak = Math.max(...points.map((point) => point.value), 1);

  return (
    <Card variant="glow" className="lg:col-span-2">
      <CardHeader>
        <CardTitle>{t('revenue.title')}</CardTitle>
        <CardDescription>{t('revenue.description')}</CardDescription>
      </CardHeader>

      <div className="px-6 pb-6">
        {points.every((point) => point.value === 0) ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            {t('revenue.empty')}
          </p>
        ) : (
          <ul className="flex h-48 items-end gap-2">
            {points.map((point) => (
              <li key={point.key} className="flex flex-1 flex-col gap-2">
                <span className="text-center text-xs font-medium text-foreground tabular-nums">
                  {currency.format(point.value)}
                </span>
                <div className="flex flex-1 items-end">
                  <div
                    className="w-full rounded-t-md bg-primary/70 transition-[height] duration-500"
                    style={{
                      height: `${Math.max((point.value / peak) * 100, 2)}%`,
                    }}
                    title={`${point.label}: ${currency.format(point.value)}`}
                  />
                </div>
                <span className="text-center text-[0.65rem] text-muted-foreground">
                  {point.label}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
