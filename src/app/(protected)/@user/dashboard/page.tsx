import { PageHeader, PageLayout } from '@/components/shared/page-header';
import { requirePermission } from '@/features/auth/rbac/require';
import { getTranslations } from 'next-intl/server';

const UserDashboardPage = async () => {
  const [user, t] = await Promise.all([
    requirePermission('dashboard.view:user'),
    getTranslations('dashboard.user'),
  ]);

  const displayName = user.name?.trim() || user.email;

  return (
    <PageLayout>
      <PageHeader
        title={t('welcome', { name: displayName })}
        subtitle={t('description')}
      />
    </PageLayout>
  );
};

export default UserDashboardPage;
