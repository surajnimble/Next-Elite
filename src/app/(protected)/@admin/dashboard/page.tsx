import { PageHeader, PageLayout } from '@/components/shared/page-header';
import { requirePermission } from '@/features/auth/rbac/require';
import { getTranslations } from 'next-intl/server';

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
    </PageLayout>
  );
};

export default AdminDashboardPage;
