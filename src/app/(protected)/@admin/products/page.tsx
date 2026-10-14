import { PageHeader, PageLayout } from '@/components/shared/page-header';
import { requirePermission } from '@/features/auth/rbac/require';
import {
  ProductListSection,
  ProductListSkeleton,
} from '@/features/products/components/product-list-section';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

interface AdminProductsPageProps {
  /** Next 15+ hands page props over as promises. */
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const AdminProductsPage = async ({ searchParams }: AdminProductsPageProps) => {
  const [, t, params] = await Promise.all([
    requirePermission('dashboard.view:admin'),
    getTranslations('products'),
    searchParams,
  ]);

  return (
    <PageLayout>
      <PageHeader title={t('title')} subtitle={t('description')} showRefresh />
      <Suspense fallback={<ProductListSkeleton />}>
        <ProductListSection searchParams={params} />
      </Suspense>
    </PageLayout>
  );
};

export default AdminProductsPage;
