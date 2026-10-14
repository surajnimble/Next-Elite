'use client';

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useTranslations } from 'next-intl';

export interface CategorySlice {
  categoryId: string;
  name: string;
  count: number;
}

interface CategoryDistributionProps {
  slices: CategorySlice[];
}

const COLORS = [
  'bg-primary',
  'bg-chart-1',
  'bg-chart-2',
  'bg-chart-3',
  'bg-chart-4',
];

export function CategoryDistribution({ slices }: CategoryDistributionProps) {
  const t = useTranslations('products');
  const total = slices.reduce((sum, slice) => sum + slice.count, 0);

  return (
    <Card variant="glow">
      <CardHeader>
        <CardTitle>{t('category.title')}</CardTitle>
        <CardDescription>
          {t('category.description', { total })}
        </CardDescription>
      </CardHeader>

      <div className="px-6 pb-6">
        {slices.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {t('category.empty')}
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {slices.map((slice, index) => {
              const share =
                total > 0 ? Math.round((slice.count / total) * 100) : 0;
              return (
                <li
                  key={slice.categoryId || slice.name}
                  className="flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className={`size-2.5 shrink-0 rounded-full ${COLORS[index % COLORS.length]}`}
                      />
                      <span className="truncate text-foreground">
                        {slice.name || t('category.uncategorised')}
                      </span>
                    </span>
                    <span className="shrink-0 text-muted-foreground tabular-nums">
                      {share}% · {slice.count}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${COLORS[index % COLORS.length]}`}
                      style={{ width: `${share}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Card>
  );
}
