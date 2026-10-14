import { PageHeader, PageLayout } from '@/components/shared/page-header';
import { Badge } from '@/components/ui/badge';
import { requirePermission } from '@/features/auth/rbac/require';
import {
  UserListSection,
  UserListSkeleton,
} from '@/features/users/components/user-list-section';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

interface AdminUsersPageProps {
  /** Next 15+ hands page props over as promises. */
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const AdminUsersPage = async ({ searchParams }: AdminUsersPageProps) => {
  const [user, t, params] = await Promise.all([
    requirePermission('dashboard.view:admin'),
    getTranslations('users'),
    searchParams,
  ]);

  return (
    <PageLayout>
      <PageHeader
        title={t('title')}
        subtitle={t('description')}
        showRefresh
        actions={
          user.role === 'admin' ? (
            <Badge variant="primaryOutline">{user.role}</Badge>
          ) : null
        }
      />
      <Suspense fallback={<UserListSkeleton />}>
        <UserListSection searchParams={params} />
      </Suspense>
    </PageLayout>
  );
};

export default AdminUsersPage;
