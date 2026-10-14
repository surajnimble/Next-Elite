'use client';

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useTranslations } from 'next-intl';

export interface RoleSlice {
  role: string;
  count: number;
}

interface RoleDistributionProps {
  slices: RoleSlice[];
}

const COLORS = [
  'bg-primary',
  'bg-chart-1',
  'bg-chart-2',
  'bg-chart-3',
  'bg-chart-4',
];

export function RoleDistribution({ slices }: RoleDistributionProps) {
  const t = useTranslations('users');
  const total = slices.reduce((sum, slice) => sum + slice.count, 0);

  return (
    <Card variant="glow">
      <CardHeader>
        <CardTitle>{t('distribution.title')}</CardTitle>
        <CardDescription>
          {t('distribution.description', { total })}
        </CardDescription>
      </CardHeader>

      <div className="px-6 pb-6">
        {slices.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {t('distribution.empty')}
          </p>
        ) : (
          <>
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
              {slices.map((slice, index) => (
                <div
                  key={slice.role}
                  className={COLORS[index % COLORS.length]}
                  style={{ width: `${(slice.count / total) * 100}%` }}
                  title={`${slice.role}: ${slice.count}`}
                />
              ))}
            </div>

            <ul className="mt-4 flex flex-col gap-2.5">
              {slices.map((slice, index) => (
                <li
                  key={slice.role}
                  className="flex items-center gap-2 text-sm"
                >
                  <span
                    className={`size-2.5 shrink-0 rounded-full ${COLORS[index % COLORS.length]}`}
                  />
                  <span className="min-w-0 flex-1 truncate text-foreground">
                    {slice.role || t('distribution.unknownRole')}
                  </span>
                  <span className="text-muted-foreground tabular-nums">
                    {slice.count}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </Card>
  );
}
