'use client';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { STATUS_BADGE_VARIANT } from '@/features/orders/lib/order-status';
import type { OrderStatus } from '@/libs/models';
import { useTranslations } from 'next-intl';

export interface OrderStatusSlice {
  status: OrderStatus;
  count: number;
}

interface OrderStatusDistributionProps {
  slices: OrderStatusSlice[];
}

const COLORS = [
  'bg-warning',
  'bg-chart-1',
  'bg-chart-2',
  'bg-chart-3',
  'bg-chart-4',
  'bg-success',
  'bg-destructive',
  'bg-secondary',
];

export function OrderStatusDistribution({
  slices,
}: OrderStatusDistributionProps) {
  const t = useTranslations('orders');
  const total = slices.reduce((sum, slice) => sum + slice.count, 0);

  return (
    <Card variant="glow">
      <CardHeader>
        <CardTitle>{t('statusDistribution.title')}</CardTitle>
        <CardDescription>
          {t('statusDistribution.description', { total })}
        </CardDescription>
      </CardHeader>

      <div className="px-6 pb-6">
        {total === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {t('statusDistribution.empty')}
          </p>
        ) : (
          <>
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
              {slices.map((slice, index) => (
                <div
                  key={slice.status}
                  className={COLORS[index % COLORS.length]}
                  style={{ width: `${(slice.count / total) * 100}%` }}
                  title={`${t(`statuses.${slice.status}`)}: ${slice.count}`}
                />
              ))}
            </div>

            <ul className="mt-4 flex flex-col gap-2.5">
              {slices.map((slice, index) => (
                <li
                  key={slice.status}
                  className="flex items-center gap-2 text-sm"
                >
                  <span
                    className={`size-2.5 shrink-0 rounded-full ${COLORS[index % COLORS.length]}`}
                  />
                  <span className="min-w-0 flex-1 truncate text-foreground">
                    {t(`statuses.${slice.status}`)}
                  </span>
                  <Badge
                    variant={STATUS_BADGE_VARIANT[slice.status]}
                    className="shrink-0"
                  >
                    {t(`statuses.${slice.status}`)}
                  </Badge>
                  <span className="shrink-0 text-muted-foreground tabular-nums">
                    {Math.round((slice.count / total) * 100)}% · {slice.count}
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
