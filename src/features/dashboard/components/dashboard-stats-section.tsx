import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { getSession } from '@/features/auth/server/session';
import {
  getAllOrders,
  getAllUsers,
  getDashboardStats,
  isApiSuccess,
} from '@/libs/api';
import type { OrderItem, OrderStatus, UserItem } from '@/libs/models';
import { getLocale, getTranslations } from 'next-intl/server';
import {
  DashboardStatsGrid,
  type DashboardMetric,
} from './dashboard-stats-grid';
import {
  OrderStatusDistribution,
  type StatusSlice,
} from './order-status-distribution';
import { RecentOrders } from './recent-orders';
import { RevenueChart, type SeriesPoint } from './revenue-chart';
import { UserGrowthChart } from './user-growth-chart';

const ORDER_LIMIT = 50;
const USER_LIMIT = 100;
const DAYS = 7;

/** Last `DAYS` calendar days, oldest first. */
function lastDays(locale: string, format: Intl.DateTimeFormatOptions) {
  const formatter = new Intl.DateTimeFormat(locale, format);

  return Array.from({ length: DAYS }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (DAYS - 1 - index));
    return {
      date,
      key: date.toISOString().slice(0, 10),
      label: formatter.format(date),
    };
  });
}

function dayKey(value: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date.toISOString().slice(0, 10);
}

function buildRevenueSeries(
  orders: OrderItem[],
  locale: string,
): SeriesPoint[] {
  const days = lastDays(locale, { month: 'short', day: 'numeric' }).map(
    (day) => ({
      ...day,
      value: 0,
    }),
  );
  const byDay = new Map(days.map((day) => [day.key, day]));

  for (const order of orders) {
    if (order.isCancelled) continue;
    const key = dayKey(order.createdAt);
    const day = key ? byDay.get(key) : undefined;
    if (day) day.value += order.total;
  }

  return days;
}

function buildGrowthSeries(users: UserItem[], locale: string): SeriesPoint[] {
  const days = lastDays(locale, { weekday: 'short' }).map((day) => ({
    ...day,
    value: 0,
  }));
  const byDay = new Map(days.map((day) => [day.key, day]));

  for (const user of users) {
    const key = dayKey(user.createdAt);
    const day = key ? byDay.get(key) : undefined;
    if (day) day.value += 1;
  }

  return days;
}

function buildStatusSlices(orders: OrderItem[]): StatusSlice[] {
  const counts = new Map<OrderStatus, number>();
  for (const order of orders) {
    counts.set(order.status, (counts.get(order.status) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count);
}

export async function DashboardStatsSection() {
  const [session, locale, t] = await Promise.all([
    getSession(),
    getLocale(),
    getTranslations('dashboard.admin'),
  ]);

  const token = session?.accessToken;
  const [stats, ordersResult, usersResult] = await Promise.all([
    getDashboardStats({ token }),
    getAllOrders({ limit: ORDER_LIMIT, sort: '-createdAt' }, { token }),
    getAllUsers({ limit: USER_LIMIT }, { token }),
  ]);

  if (!isApiSuccess(stats)) {
    return (
      <Alert className="border-destructive/40 bg-destructive/5">
        <AlertTitle className="text-destructive">{stats.message}</AlertTitle>
        <AlertDescription>{t('statsError')}</AlertDescription>
      </Alert>
    );
  }

  const orders = isApiSuccess(ordersResult) ? ordersResult.data.itemList : [];
  const users = isApiSuccess(usersResult) ? usersResult.data.userList : [];

  const metrics: DashboardMetric[] = [
    { key: 'totalUsers', icon: 'users', value: stats.data.totalUsers },
    { key: 'revenue30d', icon: 'currency', value: stats.data.revenue30d },
    { key: 'totalOrders', icon: 'cart', value: stats.data.totalOrders },
    { key: 'openTickets', icon: 'ticket', value: stats.data.openTickets },
  ];

  return (
    <div className="flex flex-col gap-6">
      <DashboardStatsGrid metrics={metrics} />

      <div className="grid gap-4 lg:grid-cols-3">
        <RevenueChart points={buildRevenueSeries(orders, locale)} />
        <OrderStatusDistribution slices={buildStatusSlices(orders)} />
      </div>

      <RecentOrders orders={orders.slice(0, 8)} />

      <UserGrowthChart points={buildGrowthSeries(users, locale)} />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-31.5 w-full rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-72 w-full rounded-xl lg:col-span-2" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
      <Skeleton className="h-80 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}
