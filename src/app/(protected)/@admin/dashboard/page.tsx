import { PageHeader, PageLayout } from '@/components/shared/page-header';
import { requirePermission } from '@/features/auth/rbac/require';
import {
  DashboardSkeleton,
  DashboardStatsSection,
} from '@/features/dashboard/components/dashboard-stats-section';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

const AdminDashboardPage = async () => {
  const [, t] = await Promise.all([
    requirePermission('dashboard.view:admin'),
    getTranslations('dashboard'),
  ]);

  return (
    <PageLayout>
      <PageHeader
        title={t('admin.title')}
        subtitle={t('admin.description')}
        showRefresh
      />
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardStatsSection />
      </Suspense>
    </PageLayout>
  );
};

export default AdminDashboardPage;
