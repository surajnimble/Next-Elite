'use client';

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import type { SeriesPoint } from './revenue-chart';

interface UserGrowthChartProps {
  points: SeriesPoint[];
}

export function UserGrowthChart({ points }: UserGrowthChartProps) {
  const t = useTranslations('dashboard.admin');
  const peak = Math.max(...points.map((point) => point.value), 1);

  return (
    <Card variant="glow">
      <CardHeader>
        <CardTitle>{t('growth.title')}</CardTitle>
        <CardDescription>{t('growth.description')}</CardDescription>
      </CardHeader>

      <div className="px-6 pb-6">
        {points.every((point) => point.value === 0) ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            {t('growth.empty')}
          </p>
        ) : (
          <ul className="flex h-40 items-end gap-2">
            {points.map((point) => (
              <li key={point.key} className="flex flex-1 flex-col gap-2">
                <div className="flex flex-1 items-end">
                  <div
                    className="w-full rounded-t-md bg-chart-2/80 transition-[height] duration-500"
                    style={{
                      height: `${Math.max((point.value / peak) * 100, 2)}%`,
                    }}
                    title={`${point.label}: ${point.value}`}
                  />
                </div>
                <span className="text-center text-[0.65rem] text-muted-foreground">
                  {point.label}
                </span>
                <span className="text-center text-xs font-medium text-foreground tabular-nums">
                  {point.value}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
