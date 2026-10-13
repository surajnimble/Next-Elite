import { PageHeader, PageLayout } from '@/components/shared/page-header';
import { requirePermission } from '@/features/auth/rbac/require';
import { DashboardStatsSkeleton } from '@/features/dashboard/components/dashboard-stats-grid';
import { DashboardStatsSection } from '@/features/dashboard/components/dashboard-stats-section';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

const AdminDashboardPage = async () => {
  const [user, t] = await Promise.all([
    requirePermission('dashboard.view:admin'),
    getTranslations('dashboard.admin'),
  ]);

  const displayName = user.name?.trim() || user.email;

  return (
    <PageLayout>
      <PageHeader
        title={t('welcome', { name: displayName })}
        subtitle={t('description')}
      />
      <Suspense fallback={<DashboardStatsSkeleton />}>
        <DashboardStatsSection />
      </Suspense>
    </PageLayout>
  );
};

export default AdminDashboardPage;