import { PageHeader, PageLayout } from '@/components/shared/page-header';
import { requirePermission } from '@/features/auth/rbac/require';
import {
  OrderListSection,
  OrderListSkeleton,
} from '@/features/orders/components/order-list-section';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

interface AdminOrdersPageProps {
  /** Next 15+ hands page props over as promises. */
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const AdminOrdersPage = async ({ searchParams }: AdminOrdersPageProps) => {
  const [, t, params] = await Promise.all([
    requirePermission('dashboard.view:admin'),
    getTranslations('orders'),
    searchParams,
  ]);

  return (
    <PageLayout>
      <PageHeader title={t('title')} subtitle={t('description')} showRefresh />
      <Suspense fallback={<OrderListSkeleton />}>
        <OrderListSection searchParams={params} />
      </Suspense>
    </PageLayout>
  );
};

export default AdminOrdersPage;
