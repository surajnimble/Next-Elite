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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { useMutation } from '@tanstack/react-query';
import type {
  PaginatedResult,
  ProductItem,
  ProductStatus,
} from '@/libs/models';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

const ALL = 'all';
const IN_STOCK = 'inStock';

const STATUSES: ProductStatus[] = ['ACTIVE', 'DRAFT', 'INACTIVE', 'ARCHIVED'];

const BADGE_VARIANT: Record<
  ProductStatus,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  ACTIVE: 'default',
  DRAFT: 'outline',
  INACTIVE: 'secondary',
  ARCHIVED: 'secondary',
};

interface ProductTableProps {
  products: ProductItem[];
  pagination: PaginatedResult;
  categories: { categoryId: string; name: string }[];
  search: string;
  categoryId: string;
  stock: string;
}

export function ProductTable({
  products,
  pagination,
  categories,
  search,
  categoryId,
  stock,
}: ProductTableProps) {
  const t = useTranslations('products');
  const locale = useLocale();
  const router = useRouter();

  const [searchInput, setSearchInput] = useState(search);
  const [categoryInput, setCategoryInput] = useState(categoryId);
  const [stockInput, setStockInput] = useState(stock);

  const currency = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
  });

  const toggle = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: ProductStatus;
    }) => {
      const response = await fetch(`/api/admin/products/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(payload.message || t('actionFailed'));
      }
      return payload;
    },
    onSuccess: () => {
      toast.success(t('statusUpdated'));
      router.refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function buildUrl(page: number) {
    const params = new URLSearchParams();
    const term = search.trim();
    if (term) params.set('search', term);
    if (categoryId) params.set('categoryId', categoryId);
    if (stock === IN_STOCK) params.set('inStock', '1');
    if (page > 1) params.set('page', String(page));
    const query = params.toString();
    return query ? `/products?${query}` : '/products';
  }

  function applyFilters(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    const term = searchInput.trim();
    if (term) params.set('search', term);
    if (categoryInput && categoryInput !== ALL) {
      params.set('categoryId', categoryInput);
    }
    if (stockInput === IN_STOCK) params.set('inStock', '1');
    const query = params.toString();
    router.push(query ? `/products?${query}` : '/products');
  }

  const from = products.length
    ? (pagination.currentPage - 1) * pagination.limit + 1
    : 0;
  const to = from + products.length - 1;

  return (
    <Card variant="glow">
      <CardHeader>
        <CardTitle>{t('catalog.title')}</CardTitle>
        <CardDescription>
          {t('catalog.description', { total: pagination.totalRecord })}
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
              placeholder={t('catalog.searchPlaceholder')}
              aria-label={t('catalog.searchPlaceholder')}
              className="ps-9"
            />
          </div>

          <Select value={categoryInput || ALL} onValueChange={setCategoryInput}>
            <SelectTrigger className="w-44" aria-label={t('catalog.category')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t('catalog.categoryAll')}</SelectItem>
              {categories.map((category) => (
                <SelectItem
                  key={category.categoryId}
                  value={category.categoryId}
                >
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={stockInput || ALL} onValueChange={setStockInput}>
            <SelectTrigger className="w-40" aria-label={t('catalog.stock')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t('catalog.stockAll')}</SelectItem>
              <SelectItem value={IN_STOCK}>{t('catalog.stockIn')}</SelectItem>
            </SelectContent>
          </Select>

          <Button type="submit" variant="outline">
            {t('catalog.apply')}
          </Button>
        </form>
      </CardHeader>

      <CardContent>
        {products.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            {t('catalog.empty')}
          </p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('catalog.product')}</TableHead>
                  <TableHead>{t('catalog.category')}</TableHead>
                  <TableHead className="text-end">
                    {t('catalog.price')}
                  </TableHead>
                  <TableHead className="text-end">
                    {t('catalog.stock')}
                  </TableHead>
                  <TableHead>{t('catalog.status')}</TableHead>
                  <TableHead>{t('catalog.created')}</TableHead>
                  <TableHead className="text-end">
                    {t('catalog.actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.productId}>
                    <TableCell>
                      <p className="text-sm font-medium text-foreground">
                        {product.name || t('unnamed')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t('skuLabel', { sku: product.sku || '—' })}
                      </p>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline">
                        {product.categoryData?.name || '—'}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-end tabular-nums">
                      {currency.format(product.price)}
                    </TableCell>

                    <TableCell className="text-end tabular-nums">
                      <span
                        className={
                          product.stock === 0
                            ? 'font-medium text-destructive'
                            : product.stock < 20
                              ? 'font-medium text-warning-foreground'
                              : 'text-foreground'
                        }
                      >
                        {t('units', { count: product.stock })}
                      </span>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          BADGE_VARIANT[product.isActive ? 'ACTIVE' : 'DRAFT']
                        }
                      >
                        {product.isActive
                          ? t('statusActive')
                          : t('statusDraft')}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                      {product.createdAt
                        ? new Intl.DateTimeFormat(locale, {
                            dateStyle: 'medium',
                          }).format(new Date(product.createdAt))
                        : '—'}
                    </TableCell>

                    <TableCell className="text-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={t('catalog.actionsFor', {
                              name: product.name || product.sku,
                            })}
                          >
                            <Icon name="settings" className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>
                            {t('catalog.actions')}
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {STATUSES.filter(
                            (status) =>
                              status !==
                              (product.isActive ? 'ACTIVE' : 'DRAFT'),
                          ).map((status) => (
                            <DropdownMenuItem
                              key={status}
                              disabled={toggle.isPending}
                              onSelect={() =>
                                toggle.mutate({
                                  id: product.productId,
                                  status,
                                })
                              }
                            >
                              {status === 'ACTIVE'
                                ? t('statusActive')
                                : status === 'DRAFT'
                                  ? t('statusDraft')
                                  : status === 'INACTIVE'
                                    ? t('statusInactive')
                                    : t('statusArchived')}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                {t('catalog.showing', {
                  from,
                  to,
                  total: pagination.totalRecord,
                })}
              </p>

              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasPrevious}
                  onClick={() =>
                    router.push(buildUrl(pagination.previousPage || 1))
                  }
                >
                  <Icon name="left" className="size-3.5" />
                  {t('catalog.previous')}
                </Button>

                <span className="px-2 text-xs text-muted-foreground tabular-nums">
                  {pagination.currentPage} / {Math.max(pagination.totalPage, 1)}
                </span>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasNext}
                  onClick={() => router.push(buildUrl(pagination.nextPage))}
                >
                  {t('catalog.next')}
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
