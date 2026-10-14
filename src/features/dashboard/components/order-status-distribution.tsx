'use client';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { OrderStatus } from '@/libs/models';
import { useTranslations } from 'next-intl';

export interface StatusSlice {
  status: OrderStatus;
  count: number;
}

const COLORS = [
  'bg-primary',
  'bg-chart-1',
  'bg-chart-2',
  'bg-chart-3',
  'bg-chart-4',
];

interface OrderStatusDistributionProps {
  slices: StatusSlice[];
}

const BADGE_VARIANT: Record<OrderStatus, 'default' | 'secondary' | 'outline'> =
  {
    DELIVERED: 'default',
    SHIPPED: 'default',
    OUT_FOR_DELIVERY: 'default',
    CONFIRMED: 'outline',
    PENDING: 'outline',
    PENDING_TOKEN: 'outline',
    CANCELLED: 'secondary',
    RETURNED: 'secondary',
  };

export function OrderStatusDistribution({
  slices,
}: OrderStatusDistributionProps) {
  const t = useTranslations('dashboard.admin');
  const total = slices.reduce((sum, slice) => sum + slice.count, 0);

  return (
    <Card variant="glow">
      <CardHeader>
        <CardTitle>{t('orderStatus.title')}</CardTitle>
        <CardDescription>
          {t('orderStatus.description', { total })}
        </CardDescription>
      </CardHeader>

      <div className="px-6 pb-6">
        {slices.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            {t('orderStatus.empty')}
          </p>
        ) : (
          <>
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
              {slices.map((slice, index) => (
                <div
                  key={slice.status}
                  className={COLORS[index % COLORS.length]}
                  style={{ width: `${(slice.count / total) * 100}%` }}
                  title={`${slice.status}: ${slice.count}`}
                />
              ))}
            </div>

            <ul className="mt-4 flex flex-wrap gap-2">
              {slices.map((slice, index) => (
                <li
                  key={slice.status}
                  className="flex items-center gap-2 rounded-lg border border-border/40 px-2.5 py-1.5 text-xs"
                >
                  <span
                    className={`size-2.5 shrink-0 rounded-full ${COLORS[index % COLORS.length]}`}
                  />
                  <Badge variant={BADGE_VARIANT[slice.status]}>
                    {t(`orderStatus.states.${slice.status}`)}
                  </Badge>
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
