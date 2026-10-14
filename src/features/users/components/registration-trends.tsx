'use client';

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useTranslations } from 'next-intl';

export interface TrendPoint {
  /** `YYYY-MM` */
  month: string;
  /** Pre-formatted month label for the active locale. */
  label: string;
  count: number;
}

interface RegistrationTrendsProps {
  points: TrendPoint[];
}

export function RegistrationTrends({ points }: RegistrationTrendsProps) {
  const t = useTranslations('users');
  const peak = Math.max(...points.map((point) => point.count), 1);

  return (
    <Card variant="glow">
      <CardHeader>
        <CardTitle>{t('trends.title')}</CardTitle>
        <CardDescription>{t('trends.description')}</CardDescription>
      </CardHeader>

      <div className="px-6 pb-6">
        {points.every((point) => point.count === 0) ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {t('trends.empty')}
          </p>
        ) : (
          <ul className="flex h-40 items-end gap-2">
            {points.map((point) => (
              <li key={point.month} className="flex flex-1 flex-col gap-2">
                <div className="flex flex-1 items-end">
                  <div
                    className="w-full rounded-t-md bg-primary/70 transition-[height] duration-500"
                    style={{
                      height: `${Math.max((point.count / peak) * 100, 2)}%`,
                    }}
                    title={`${point.label}: ${point.count}`}
                  />
                </div>
                <span className="text-center text-[0.65rem] text-muted-foreground">
                  {point.label}
                </span>
                <span className="text-center text-xs font-medium text-foreground tabular-nums">
                  {point.count}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
