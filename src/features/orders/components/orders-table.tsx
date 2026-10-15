'use client';

import { Icon } from '@/components/icons/app-icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ORDER_STATUSES,
  STATUS_BADGE_VARIANT,
  vendorNames,
} from '@/features/orders/lib/order-status';
import type { OrderItem, PaginatedResult } from '@/libs/models';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

const ALL = 'all';

interface OrdersTableProps {
  orders: OrderItem[];
  pagination: PaginatedResult;
  search: string;
  status: string;
  from: string;
  to: string;
}

/** Vendor shops are listed one per line; the rest collapse into a counter. */
const MAX_VENDORS = 2;

export function OrdersTable({
  orders,
  pagination,
  search,
  status,
  from,
  to,
}: OrdersTableProps) {
  const t = useTranslations('orders');
  const locale = useLocale();
  const router = useRouter();

  const [searchInput, setSearchInput] = useState(search);
  const [statusInput, setStatusInput] = useState(status);
  const [fromInput, setFromInput] = useState(from);
  const [toInput, setToInput] = useState(to);

  const currency = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
  });

  const dateFormat = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' });

  /** Filters live in the URL so refresh and paging keep them. */
  function applyFilters(event: FormEvent) {
    event.preventDefault();
    router.push(
      buildUrl(1, {
        search: searchInput,
        status: statusInput,
        from: fromInput,
        to: toInput,
      }),
    );
  }

  function clearFilters() {
    setSearchInput('');
    setStatusInput('');
    setFromInput('');
    setToInput('');
    router.push('/orders');
  }

  function goToPage(page: number) {
    router.push(buildUrl(page, { search, status, from, to }));
  }

  function buildUrl(
    page: number,
    filters: { search: string; status: string; from: string; to: string },
  ) {
    const params = new URLSearchParams();

    const term = filters.search.trim();
    if (term) params.set('search', term);
    if (filters.status && filters.status !== ALL) {
      params.set('status', filters.status);
    }
    if (filters.from) params.set('from', filters.from);
    if (filters.to) params.set('to', filters.to);
    if (page > 1) params.set('page', String(page));

    const query = params.toString();
    return query ? `/orders?${query}` : '/orders';
  }

  const hasFilters = !!(search || status || from || to);
  const rowFrom = orders.length
    ? (pagination.currentPage - 1) * pagination.limit + 1
    : 0;
  const rowTo = rowFrom + orders.length - 1;

  return (
    <Card variant="glow">
      <CardHeader>
        <CardTitle>{t('table.title')}</CardTitle>
        <CardDescription>
          {t('table.description', { total: pagination.totalRecord })}
        </CardDescription>

        <form
          onSubmit={applyFilters}
          className="mt-4 flex flex-wrap items-center gap-2"
        >
          <div className="relative min-w-48 flex-1">
            <Icon
              name="search"
              className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder={t('table.searchPlaceholder')}
              aria-label={t('table.searchPlaceholder')}
              className="ps-9"
            />
          </div>

          <Select value={statusInput || ALL} onValueChange={setStatusInput}>
            <SelectTrigger className="w-44" aria-label={t('table.status')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t('table.statusAll')}</SelectItem>
              {ORDER_STATUSES.map((value) => (
                <SelectItem key={value} value={value}>
                  {t(`statuses.${value}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={fromInput}
            max={toInput || undefined}
            onChange={(event) => setFromInput(event.target.value)}
            aria-label={t('table.from')}
            title={t('table.from')}
            className="w-40"
          />

          <Input
            type="date"
            value={toInput}
            min={fromInput || undefined}
            onChange={(event) => setToInput(event.target.value)}
            aria-label={t('table.to')}
            title={t('table.to')}
            className="w-40"
          />

          <Button type="submit" variant="outline">
            {t('table.apply')}
          </Button>

          {hasFilters ? (
            <Button type="button" variant="ghost" onClick={clearFilters}>
              {t('table.clear')}
            </Button>
          ) : null}
        </form>
      </CardHeader>

      <CardContent>
        {orders.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            {t('table.empty')}
          </p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.order')}</TableHead>
                  <TableHead>{t('table.vendor')}</TableHead>
                  <TableHead className="text-end">{t('table.items')}</TableHead>
                  <TableHead>{t('table.status')}</TableHead>
                  <TableHead className="text-end">{t('table.total')}</TableHead>
                  <TableHead>{t('table.date')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const vendors = vendorNames(order);
                  const shown = vendors.slice(0, MAX_VENDORS);
                  const rest = vendors.length - shown.length;

                  return (
                    <TableRow key={order.orderId}>
                      <TableCell>
                        <p className="text-sm font-medium text-foreground">
                          {order.orderNumber || t('table.empty')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t('idLabel', { id: order.orderId })}
                        </p>
                      </TableCell>

                      <TableCell>
                        {vendors.length === 0 ? (
                          <span className="text-xs text-muted-foreground">
                            {t('noVendor')}
                          </span>
                        ) : (
                          <div className="min-w-0">
                            {shown.map((name) => (
                              <p
                                key={name}
                                className="truncate text-sm text-foreground"
                              >
                                {name}
                              </p>
                            ))}
                            {rest > 0 ? (
                              <p className="text-xs text-muted-foreground">
                                {t('vendorLabel', { count: rest })}
                              </p>
                            ) : null}
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="text-end">
                        <span className="text-sm text-foreground tabular-nums">
                          {t('itemsLabel', { count: order.itemCount })}
                        </span>
                        {order.totalQty > order.itemCount ? (
                          <p className="text-xs text-muted-foreground tabular-nums">
                            {t('unitsLabel', { count: order.totalQty })}
                          </p>
                        ) : null}
                      </TableCell>

                      <TableCell>
                        <Badge variant={STATUS_BADGE_VARIANT[order.status]}>
                          {t(`statuses.${order.status}`)}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-end text-sm font-medium tabular-nums">
                        {currency.format(order.total ?? 0)}
                      </TableCell>

                      <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                        {order.createdAt
                          ? dateFormat.format(new Date(order.createdAt))
                          : '—'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                {t('table.showing', {
                  from: rowFrom,
                  to: rowTo,
                  total: pagination.totalRecord,
                })}
              </p>

              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasPrevious}
                  onClick={() => goToPage(pagination.previousPage || 1)}
                >
                  <Icon name="left" className="size-3.5" />
                  {t('table.previous')}
                </Button>

                <span className="px-2 text-xs text-muted-foreground tabular-nums">
                  {pagination.currentPage} / {Math.max(pagination.totalPage, 1)}
                </span>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasNext}
                  onClick={() => goToPage(pagination.nextPage)}
                >
                  {t('table.next')}
                  <Icon name="right" className="size-3.5" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
