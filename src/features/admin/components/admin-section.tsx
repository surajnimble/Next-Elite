import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { hasPermission } from '@/features/auth/rbac/can';
import { getSession } from '@/features/auth/server/session';
import { ApiKeysPanel } from '@/features/admin/components/api-keys-panel';
import { AuditLogTable } from '@/features/admin/components/audit-log-table';
import { JobsPanel } from '@/features/admin/components/jobs-panel';
import { MaintenancePanel } from '@/features/admin/components/maintenance-panel';
import { PermissionsPanel } from '@/features/admin/components/permissions-panel';
import { SubAdminsTable } from '@/features/admin/components/sub-admins-table';
import { SystemPanel } from '@/features/admin/components/system-panel';
import {
  getApiKeys,
  getAuditLogs,
  getCronJobs,
  getFailedJobs,
  getMaintenance,
  getPermissions,
  getSubAdmins,
  getSystemHealth,
  isApiSuccess,
} from '@/libs/api';
import type { AuditLogQuery, SettingsListQuery } from '@/libs/models';
import { getTranslations } from 'next-intl/server';

const PAGE_LIMIT = 10;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function readQuery(params: URLSearchParams) {
  const subAdminQuery: SettingsListQuery = { limit: PAGE_LIMIT };

  const page = Number(params.get('page'));
  if (Number.isInteger(page) && page > 1) subAdminQuery.page = page;

  const action = params.get('action') ?? '';
  const from = params.get('from') ?? '';
  const to = params.get('to') ?? '';

  const auditQuery: AuditLogQuery = {
    limit: PAGE_LIMIT,
    page: subAdminQuery.page,
  };
  if (action) auditQuery.action = action;
  if (ISO_DATE.test(from)) auditQuery.from = from;
  if (ISO_DATE.test(to)) auditQuery.to = to;

  return {
    subAdminQuery,
    auditQuery,
    action,
    from,
    to,
  };
}

/** Union of every permission any role has — the picker is built from the API. */
function unionPermissions(roleList: Record<string, string[]>): string[] {
  const set = new Set<string>();
  for (const permissions of Object.values(roleList)) {
    for (const permission of permissions) set.add(permission);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

export async function AdminSection({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const session = await getSession();
  const t = await getTranslations('admin');

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === 'string' && value) params.set(key, value);
  }
  const { subAdminQuery, auditQuery, action, from, to } = readQuery(params);

  const token = session?.accessToken;
  const canManage = hasPermission(
    session?.user.permissions ?? [],
    'dashboard.view:admin',
  );

  // Everything is fetched in parallel; each panel degrades on its own so one
  // refused endpoint (cron, the failed-job queue and maintenance writes are
  // super-admin-only) never blanks the whole page.
  const [
    adminsResult,
    permissionsResult,
    auditResult,
    healthResult,
    cronResult,
    failedResult,
    maintenanceResult,
    apiKeysResult,
  ] = await Promise.all([
    getSubAdmins(subAdminQuery, { token }),
    getPermissions({ token }),
    getAuditLogs(auditQuery, { token }),
    getSystemHealth({ token }),
    getCronJobs({ token }),
    getFailedJobs({ limit: PAGE_LIMIT }, { token }),
    getMaintenance({ token }),
    getApiKeys({ token }),
  ]);

  if (!isApiSuccess(adminsResult)) {
    return (
      <Alert className="border-destructive/40 bg-destructive/5">
        <AlertTitle className="text-destructive">
          {adminsResult.message}
        </AlertTitle>
        <AlertDescription>{t('loadError')}</AlertDescription>
      </Alert>
    );
  }

  const roleList = isApiSuccess(permissionsResult)
    ? permissionsResult.data.roleList
    : {};

  const cronJobs = isApiSuccess(cronResult) ? cronResult.data.jobList : null;

  return (
    <div className="flex flex-col gap-6">
      <SubAdminsTable
        admins={adminsResult.data.itemList}
        pagination={adminsResult.data}
        availablePermissions={unionPermissions(roleList)}
        canManage={canManage}
        canImpersonate={canManage}
      />

      <PermissionsPanel roleList={roleList} canManage={canManage} />

      <SystemPanel
        health={isApiSuccess(healthResult) ? healthResult.data : null}
        cron={cronJobs}
        cronError={
          isApiSuccess(cronResult) ? undefined : t('cron.superAdminOnly')
        }
      />

      <JobsPanel
        cron={cronJobs}
        cronError={
          isApiSuccess(cronResult) ? undefined : t('cron.superAdminOnly')
        }
        failed={isApiSuccess(failedResult) ? failedResult.data : null}
        failedError={
          isApiSuccess(failedResult) ? undefined : t('failed.superAdminOnly')
        }
        canManage={canManage}
      />

      <MaintenancePanel
        status={isApiSuccess(maintenanceResult) ? maintenanceResult.data : null}
        canManage={canManage}
        error={
          isApiSuccess(maintenanceResult)
            ? undefined
            : t('maintenance.superAdminOnly')
        }
      />

      <ApiKeysPanel
        data={isApiSuccess(apiKeysResult) ? apiKeysResult.data : null}
        error={isApiSuccess(apiKeysResult) ? undefined : apiKeysResult.message}
        canManage={canManage}
      />

      {isApiSuccess(auditResult) ? (
        <AuditLogTable
          logs={auditResult.data.itemList}
          pagination={auditResult.data}
          action={action}
          from={from}
          to={to}
          actions={[
            ...new Set(
              auditResult.data.itemList
                .map((log) => log.action)
                .filter(Boolean),
            ),
          ]}
        />
      ) : (
        <Alert className="border-destructive/40 bg-destructive/5">
          <AlertTitle className="text-destructive">
            {auditResult.message}
          </AlertTitle>
          <AlertDescription>{t('loadError')}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export function AdminSectionSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-96 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
      <Skeleton className="h-80 w-full rounded-xl" />
      <Skeleton className="h-96 w-full rounded-xl" />
    </div>
  );
}
