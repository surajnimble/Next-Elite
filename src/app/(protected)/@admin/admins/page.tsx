import { PageHeader, PageLayout } from '@/components/shared/page-header';
import { requirePermission } from '@/features/auth/rbac/require';
import {
  AdminSection,
  AdminSectionSkeleton,
} from '@/features/admin/components/admin-section';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

interface AdminAdminsPageProps {
  /** Next 15+ hands page props over as promises. */
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const AdminAdminsPage = async ({ searchParams }: AdminAdminsPageProps) => {
  const [, t, params] = await Promise.all([
    requirePermission('dashboard.view:admin'),
    getTranslations('admin'),
    searchParams,
  ]);

  return (
    <PageLayout>
      <PageHeader title={t('title')} subtitle={t('description')} showRefresh />
      <Suspense fallback={<AdminSectionSkeleton />}>
        <AdminSection searchParams={params} />
      </Suspense>
    </PageLayout>
  );
};

export default AdminAdminsPage;
