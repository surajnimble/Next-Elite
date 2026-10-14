import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { getSession } from '@/features/auth/server/session';
import { getAllProducts, getProductFilters, isApiSuccess } from '@/libs/api';
import type { ProductItem, ProductListQuery } from '@/libs/models';
import { getTranslations } from 'next-intl/server';
import {
  CategoryDistribution,
  type CategorySlice,
} from './category-distribution';
import { LOW_STOCK_THRESHOLD, ProductStats } from './product-stats';
import { ProductTable } from './product-table';

const AGGREGATE_LIMIT = 100;
const TABLE_LIMIT = 10;

function readQuery(params: URLSearchParams) {
  const query: ProductListQuery = { limit: TABLE_LIMIT };

  const page = Number(params.get('page'));
  if (Number.isInteger(page) && page > 1) query.page = page;

  const search = params.get('search')?.trim();
  if (search) query.search = search;

  const categoryId = params.get('categoryId');
  if (categoryId) query.categoryId = categoryId;

  const inStock = params.get('inStock');
  if (inStock === '1') query.inStock = 1;

  return {
    query,
    search: search ?? '',
    categoryId: categoryId ?? '',
    stock: inStock === '1' ? 'inStock' : '',
  };
}

function buildMetrics(products: ProductItem[], total: number) {
  const active = products.filter((product) => product.isActive);
  const inStock = active.filter((product) => product.stock > 0);
  const lowStock = active.filter(
    (product) => product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD,
  );

  return {
    total,
    inStock: Math.min(inStock.length, total),
    lowStock: Math.min(lowStock.length, total),
    totalValue: active.reduce(
      (sum, product) => sum + product.price * product.stock,
      0,
    ),
  };
}

function buildCategories(products: ProductItem[]): CategorySlice[] {
  const counts = new Map<string, CategorySlice>();
  for (const product of products) {
    const name = product.categoryData?.name || '';
    const key = product.categoryData?.categoryId || name || 'none';
    const existing = counts.get(key);
    if (existing) existing.count += 1;
    else {
      counts.set(key, {
        categoryId: product.categoryData?.categoryId || '',
        name,
        count: 1,
      });
    }
  }
  return [...counts.values()].sort((a, b) => b.count - a.count);
}

export async function ProductListSection({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const [session, t] = await Promise.all([
    getSession(),
    getTranslations('products'),
  ]);

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === 'string' && value) params.set(key, value);
  }
  const { query, search, categoryId, stock } = readQuery(params);

  const token = session?.accessToken;
  const [pageResult, aggregateResult, filtersResult] = await Promise.all([
    getAllProducts(query, { token }),
    getAllProducts({ limit: AGGREGATE_LIMIT }, { token }),
    getProductFilters({}, { token }),
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
  const allProducts = isApiSuccess(aggregateResult)
    ? aggregateResult.data.productList
    : page.productList;
  const total = isApiSuccess(aggregateResult)
    ? aggregateResult.data.totalRecord
    : page.totalRecord;

  const categories = isApiSuccess(filtersResult)
    ? filtersResult.data.categoryList.map(({ categoryId, name }) => ({
        categoryId,
        name,
      }))
    : buildCategories(allProducts);

  return (
    <div className="flex flex-col gap-6">
      <ProductStats metrics={buildMetrics(allProducts, total)} />

      <CategoryDistribution slices={buildCategories(allProducts)} />

      <ProductTable
        products={page.productList}
        pagination={page}
        categories={categories}
        search={search}
        categoryId={categoryId}
        stock={stock}
      />
    </div>
  );
}

export function ProductListSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-31.5 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
      <Skeleton className="h-96 w-full rounded-xl" />
    </div>
  );
}
