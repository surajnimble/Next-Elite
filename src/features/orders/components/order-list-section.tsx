import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { getSession } from '@/features/auth/server/session';
import {
  STATUS_BADGE_VARIANT,
  countInTransit,
  countOpen,
  isOrderStatus,
  sumRevenue,
} from '@/features/orders/lib/order-status';
import { getAllOrders, isApiSuccess } from '@/libs/api';
import type { OrderItem, OrderListQuery, OrderStatus } from '@/libs/models';
import { getLocale, getTranslations } from 'next-intl/server';
import {
  OrderStatusDistribution,
  type OrderStatusSlice,
} from './order-status-distribution';
import { OrderStats, type OrderMetrics } from './order-stats';
import { OrderTrends, type OrderTrendPoint } from './order-trends';
import { OrdersTable } from './orders-table';

/** The backend caps `limit` at 100 — enough to compute the aggregates. */
const AGGREGATE_LIMIT = 100;
const TABLE_LIMIT = 10;

/** `listOrdersSchema` only accepts a bare ISO date, never a full timestamp. */
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function readQuery(params: URLSearchParams) {
  const query: OrderListQuery = { limit: TABLE_LIMIT };

  const page = Number(params.get('page'));
  if (Number.isInteger(page) && page > 1) query.page = page;

  const search = params.get('search')?.trim();
  if (search) query.search = search;

  const status = params.get('status') ?? '';
  if (isOrderStatus(status)) query.status = status;

  const from = params.get('from') ?? '';
  if (ISO_DATE.test(from)) query.from = from;

  const to = params.get('to') ?? '';
  if (ISO_DATE.test(to)) query.to = to;

  return { query, search: search ?? '', status, from, to };
}

function buildMetrics(orders: OrderItem[], total: number): OrderMetrics {
  return {
    total,
    pending: Math.min(countOpen(orders), total),
    shipped: Math.min(countInTransit(orders), total),
    revenue: sumRevenue(orders),
  };
}

/** Orders placed in each of the last six months, oldest first. */
function buildTrends(orders: OrderItem[], locale: string): OrderTrendPoint[] {
  const formatter = new Intl.DateTimeFormat(locale, { month: 'short' });
  const counts = new Map<string, number>();
  const now = new Date();

  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (5 - index), 1),
    );
    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
    counts.set(key, 0);
    return { key, label: formatter.format(date) };
  });

  for (const order of orders) {
    const created = new Date(order.createdAt);
    if (Number.isNaN(created.getTime())) continue;
    const key = `${created.getUTCFullYear()}-${String(created.getUTCMonth() + 1).padStart(2, '0')}`;
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return months.map(({ key, label }) => ({
    month: key,
    label,
    count: counts.get(key) ?? 0,
  }));
}

/** Every known status is listed, even the ones nothing is currently in. */
function buildStatuses(orders: OrderItem[]): OrderStatusSlice[] {
  const counts = new Map<OrderStatus, number>();

  for (const status of Object.keys(STATUS_BADGE_VARIANT) as OrderStatus[]) {
    counts.set(status, 0);
  }
  for (const order of orders) {
    counts.set(order.status, (counts.get(order.status) ?? 0) + 1);
  }

  return [...counts].map(([status, count]) => ({ status, count }));
}

export async function OrderListSection({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const [session, locale, t] = await Promise.all([
    getSession(),
    getLocale(),
    getTranslations('orders'),
  ]);

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === 'string' && value) params.set(key, value);
  }
  const { query, search, status, from, to } = readQuery(params);

  const token = session?.accessToken;
  const [pageResult, aggregateResult] = await Promise.all([
    getAllOrders(query, { token }),
    getAllOrders({ limit: AGGREGATE_LIMIT }, { token }),
  ]);

  if (!isApiSuccess(pageResult)) {
    return (
      <Alert className="border-destructive/40 bg-destructive/5">
        <AlertTitle className="text-destructive">
          {pageResult.message}
        </AlertTitle>
        <AlertDescription>{t('loadError')}</AlertDescription>
      </Alert>
    );
  }

  const page = pageResult.data;
  const allOrders = isApiSuccess(aggregateResult)
    ? aggregateResult.data.itemList
    : page.itemList;
  const total = isApiSuccess(aggregateResult)
    ? aggregateResult.data.totalRecord
    : page.totalRecord;

  return (
    <div className="flex flex-col gap-6">
      <OrderStats metrics={buildMetrics(allOrders, total)} />

      <div className="grid gap-4 lg:grid-cols-2">
        <OrderTrends points={buildTrends(allOrders, locale)} />
        <OrderStatusDistribution slices={buildStatuses(allOrders)} />
      </div>

      <OrdersTable
        orders={page.itemList}
        pagination={page}
        search={search}
        status={status}
        from={from}
        to={to}
      />
    </div>
  );
}

export function OrderListSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-31.5 w-full rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
      <Skeleton className="h-96 w-full rounded-xl" />
    </div>
  );
}
