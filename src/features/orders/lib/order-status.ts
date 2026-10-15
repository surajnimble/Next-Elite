import type { OrderItem, OrderStatus } from '@/libs/models';

export const ORDER_STATUSES = [
  'PENDING',
  'PENDING_TOKEN',
  'CONFIRMED',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'RETURNED',
] as const satisfies readonly OrderStatus[];

const OPEN_STATUSES = ['PENDING', 'PENDING_TOKEN', 'CONFIRMED'] as const;

const IN_TRANSIT_STATUSES = ['SHIPPED', 'OUT_FOR_DELIVERY'] as const;

export type OrderStatusBadgeVariant =
  | 'default'
  | 'secondary'
  | 'outline'
  | 'success'
  | 'warning'
  | 'destructive';

export const STATUS_BADGE_VARIANT: Record<
  OrderStatus,
  OrderStatusBadgeVariant
> = {
  PENDING: 'warning',
  PENDING_TOKEN: 'warning',
  CONFIRMED: 'default',
  SHIPPED: 'default',
  OUT_FOR_DELIVERY: 'default',
  DELIVERED: 'success',
  CANCELLED: 'destructive',
  RETURNED: 'secondary',
};

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}

export function countOpen(orders: OrderItem[]): number {
  return orders.filter((order) =>
    (OPEN_STATUSES as readonly string[]).includes(order.status),
  ).length;
}

export function countInTransit(orders: OrderItem[]): number {
  return orders.filter((order) =>
    (IN_TRANSIT_STATUSES as readonly string[]).includes(order.status),
  ).length;
}

/** Counts only `PAID` orders, matching the backend's own `getDashboard()` rule. */
export function sumRevenue(orders: OrderItem[]): number {
  return orders
    .filter((order) => order.paymentStatus === 'PAID')
    .reduce((sum, order) => sum + (order.total || 0), 0);
}

/** The list endpoint returns no customer identity, so vendors stand in for it. */
export function vendorNames(order: OrderItem): string[] {
  const names = new Set<string>();

  for (const subOrder of order.subOrderList ?? []) {
    const name = subOrder?.vendorData?.shopName?.trim();
    if (name) names.add(name);
  }

  return [...names];
}
