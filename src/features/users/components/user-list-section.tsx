import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { getSession } from '@/features/auth/server/session';
import { getAllUsers, isApiSuccess } from '@/libs/api';
import type { UserItem, UserListQuery } from '@/libs/models';
import { getLocale, getTranslations } from 'next-intl/server';
import { RegistrationTrends, type TrendPoint } from './registration-trends';
import { RoleDistribution, type RoleSlice } from './role-distribution';
import { UserStats, type UserMetrics } from './user-stats';
import { UsersTable } from './users-table';

/** The backend caps `limit` at 100 — enough to compute the aggregates. */
const AGGREGATE_LIMIT = 100;
const TABLE_LIMIT = 10;

function readQuery(params: URLSearchParams) {
  const query: UserListQuery = { limit: TABLE_LIMIT };

  const page = Number(params.get('page'));
  if (Number.isInteger(page) && page > 1) query.page = page;

  const search = params.get('search')?.trim();
  if (search) query.search = search;

  const role = params.get('role');
  if (role) query.role = role;

  const status = params.get('status');
  if (status === 'active' || status === 'inactive' || status === 'suspended') {
    query.status = status;
  }

  return {
    query,
    search: search ?? '',
    role: role ?? '',
    status: status ?? '',
  };
}

function buildMetrics(users: UserItem[], total: number): UserMetrics {
  const active = users.filter((user) => user.isActive).length;
  const now = new Date();
  const newThisMonth = users.filter((user) => {
    const created = new Date(user.createdAt);
    if (Number.isNaN(created.getTime())) return false;
    return (
      created.getUTCFullYear() === now.getUTCFullYear() &&
      created.getUTCMonth() === now.getUTCMonth()
    );
  }).length;

  return {
    total,
    active: Math.min(active, total),
    newThisMonth,
    activeRate:
      total > 0 ? Math.round((Math.min(active, total) / total) * 100) : 0,
  };
}

function buildTrends(users: UserItem[], locale: string): TrendPoint[] {
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

  for (const user of users) {
    const created = new Date(user.createdAt);
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

function buildRoles(users: UserItem[]): RoleSlice[] {
  const counts = new Map<string, number>();
  for (const user of users) {
    const role = user.role || 'UNKNOWN';
    counts.set(role, (counts.get(role) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([role, count]) => ({ role, count }))
    .sort((a, b) => b.count - a.count);
}

export async function UserListSection({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const [session, locale, t] = await Promise.all([
    getSession(),
    getLocale(),
    getTranslations('users'),
  ]);

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === 'string' && value) params.set(key, value);
  }
  const { query, search, role, status } = readQuery(params);

  const token = session?.accessToken;
  const [pageResult, aggregateResult] = await Promise.all([
    getAllUsers(query, { token }),
    getAllUsers({ limit: AGGREGATE_LIMIT }, { token }),
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
  const allUsers = isApiSuccess(aggregateResult)
    ? aggregateResult.data.userList
    : page.userList;
  const total = isApiSuccess(aggregateResult)
    ? aggregateResult.data.totalRecord
    : page.totalRecord;

  return (
    <div className="flex flex-col gap-6">
      <UserStats metrics={buildMetrics(allUsers, total)} />

      <div className="grid gap-4 lg:grid-cols-2">
        <RegistrationTrends points={buildTrends(allUsers, locale)} />
        <RoleDistribution slices={buildRoles(allUsers)} />
      </div>

      <UsersTable
        users={page.userList}
        pagination={page}
        roles={buildRoles(allUsers).map((slice) => slice.role)}
        search={search}
        role={role}
        status={status}
      />
    </div>
  );
}

export function UserListSkeleton() {
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
