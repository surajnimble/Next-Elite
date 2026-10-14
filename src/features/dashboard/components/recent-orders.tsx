'use client';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { OrderItem, OrderStatus } from '@/libs/models';
import { useLocale, useTranslations } from 'next-intl';

interface RecentOrdersProps {
  orders: OrderItem[];
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

export function RecentOrders({ orders }: RecentOrdersProps) {
  const t = useTranslations('dashboard.admin');
  const locale = useLocale();

  const currency = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
  });

  return (
    <Card variant="glow">
      <CardHeader>
        <CardTitle>{t('recentOrders.title')}</CardTitle>
        <CardDescription>{t('recentOrders.description')}</CardDescription>
      </CardHeader>

      <div className="px-6 pb-6">
        {orders.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            {t('recentOrders.empty')}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('recentOrders.order')}</TableHead>
                <TableHead>{t('recentOrders.vendor')}</TableHead>
                <TableHead className="text-end">
                  {t('recentOrders.amount')}
                </TableHead>
                <TableHead>{t('recentOrders.status')}</TableHead>
                <TableHead>{t('recentOrders.date')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.orderId}>
                  <TableCell className="font-medium tabular-nums">
                    #{order.orderNumber || order.orderId.slice(-4)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {order.subOrderList[0]?.vendorData?.shopName || '—'}
                  </TableCell>
                  <TableCell className="text-end tabular-nums">
                    {currency.format(order.total)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={BADGE_VARIANT[order.status]}>
                      {t(`orderStatus.states.${order.status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                    {order.createdAt
                      ? new Intl.DateTimeFormat(locale, {
                          dateStyle: 'medium',
                        }).format(new Date(order.createdAt))
                      : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </Card>
  );
}
