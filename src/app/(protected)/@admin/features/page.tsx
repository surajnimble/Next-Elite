import { PageHeader, PageLayout } from '@/components/shared/page-header';
import { requirePermission } from '@/features/auth/rbac/require';
import {
  FeatureFlagsSection,
  FeatureFlagsSkeleton,
} from '@/features/features/components/feature-flags-section';
import { hasPermission } from '@/features/auth/rbac/can';
import { getCurrentUser } from '@/features/auth/server/session';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

const AdminFeaturesPage = async () => {
  const [user, t] = await Promise.all([
    getCurrentUser(),
    getTranslations('features'),
    requirePermission('dashboard.view:admin'),
  ]);

  const canEdit = hasPermission(
    user?.permissions ?? [],
    'dashboard.view:admin',
  );

  return (
    <PageLayout>
      <PageHeader title={t('title')} subtitle={t('description')} showRefresh />
      <Suspense fallback={<FeatureFlagsSkeleton />}>
        <FeatureFlagsSection canEdit={canEdit} />
      </Suspense>
    </PageLayout>
  );
};

export default AdminFeaturesPage;
