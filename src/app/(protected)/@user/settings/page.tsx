import { PageHeader, PageLayout } from '@/components/shared/page-header';
import { requirePermission } from '@/features/auth/rbac/require';
import {
  SettingsSection,
  SettingsSectionSkeleton,
} from '@/features/settings/components/settings-section';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

const UserSettingsPage = async () => {
  const [, t] = await Promise.all([
    requirePermission('dashboard.view:user'),
    getTranslations('settings'),
  ]);

  return (
    <PageLayout>
      <PageHeader title={t('title')} subtitle={t('description')} showRefresh />
      <Suspense fallback={<SettingsSectionSkeleton />}>
        <SettingsSection />
      </Suspense>
    </PageLayout>
  );
};

export default UserSettingsPage;
