import { PageHeader, PageLayout } from '@/components/shared/page-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { requirePermission } from '@/features/auth/rbac/require';
import { getTranslations } from 'next-intl/server';

const UserProfilePage = async () => {
  const [user, t] = await Promise.all([
    requirePermission('dashboard.view:user'),
    getTranslations('profile'),
  ]);

  const displayName = user.name?.trim() || user.email;
  const nameParts = displayName.split(/\s+/).filter(Boolean);
  const initials =
    (nameParts.length > 1
      ? nameParts
          .slice(0, 2)
          .map((part) => part.charAt(0))
          .join('')
      : (nameParts[0]?.slice(0, 2) ?? '')
    ).toUpperCase() || 'U';
  const isAdmin = user.role === 'admin';

  return (
    <PageLayout>
      <PageHeader title={t('title')} subtitle={t('description')} />

      <Card>
        <CardHeader>
          <CardTitle>{t('accountInfo')}</CardTitle>
          <CardDescription>{t('accountInfoDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              {user.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt={user.name} />
              ) : null}
              <AvatarFallback className="text-lg font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-foreground">
                {user.name || t('notProvided')}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                {user.email}
              </p>
            </div>
            <Badge
              className="ms-auto"
              variant={isAdmin ? 'default' : 'secondary'}
            >
              {isAdmin ? t('roleAdmin') : t('roleUser')}
            </Badge>
          </div>

          <Separator />

          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <dt className="text-xs font-medium text-muted-foreground">
                {t('name')}
              </dt>
              <dd className="text-sm break-words text-foreground">
                {user.name || t('notProvided')}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-xs font-medium text-muted-foreground">
                {t('email')}
              </dt>
              <dd className="text-sm break-all text-foreground">
                {user.email || t('notProvided')}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-xs font-medium text-muted-foreground">
                {t('phone')}
              </dt>
              <dd className="text-sm break-all text-foreground">
                {user.phone || t('notProvided')}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-xs font-medium text-muted-foreground">
                {t('userId')}
              </dt>
              <dd className="text-sm break-all text-foreground">
                {user.id || t('notProvided')}
              </dd>
            </div>
          </dl>

          <Separator />

          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground">
              {t('roles')}
            </p>
            <div className="flex flex-wrap gap-2">
              {user.apiRoles.length ? (
                user.apiRoles.map((role) => (
                  <Badge key={role} variant="outline">
                    {role}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">
                  {t('notProvided')}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground">
              {t('permissions')}
            </p>
            <div className="flex flex-wrap gap-2">
              {user.permissions.length ? (
                user.permissions.map((permission) => (
                  <Badge key={permission} variant="primaryOutline">
                    {permission}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">
                  {t('notProvided')}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default UserProfilePage;
