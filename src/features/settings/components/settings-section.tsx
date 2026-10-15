import { Skeleton } from '@/components/ui/skeleton';
import { hasPermission } from '@/features/auth/rbac/can';
import { getSession } from '@/features/auth/server/session';
import { SettingsPanel } from '@/features/settings/components/settings-panel';
import type { SettingsCategoryGroup } from '@/features/settings/components/all-settings';
import type { SettingValues } from '@/features/settings/hooks/use-system-settings';
import { getPublicSettings, getSettings, isApiSuccess } from '@/libs/api';
import type { SystemSettingItem } from '@/libs/models';

/** The settings tabs read this many keys; the backend caps `limit` at 100. */
const SETTINGS_LIMIT = 100;
const MAX_PAGES = 5;

/**
 * The list endpoint returns one row per key. The UI only wants a lookup, so
 * page through and flatten here rather than shipping 183 rows twice.
 */
function toLookup(items: SystemSettingItem[]): {
  values: SettingValues;
  groups: SettingsCategoryGroup[];
} {
  const values: SettingValues = {};
  const groups: SettingsCategoryGroup[] = [];

  for (const item of items) {
    if (!item.key) continue;

    values[item.key] = item.value;

    const category = item.category || 'other';
    let group = groups.find((entry) => entry.category === category);

    if (!group) {
      group = { category, keys: [] };
      groups.push(group);
    }
    group.keys.push(item.key);
  }

  groups.sort((a, b) => a.category.localeCompare(b.category));

  return { values, groups };
}

async function fetchSettings(token: string | undefined, canEdit: boolean) {
  const lookup: SettingValues = {};

  // A regular user cannot read the admin-guarded list endpoint, but every
  // setting the General and Storage tabs need is flagged `isPublic`, so the
  // unauthenticated public endpoint serves them as read-only values.
  if (!canEdit) {
    const result = await getPublicSettings();
    if (!isApiSuccess(result)) throw new Error(result.message);
    return { values: { ...result.data }, groups: [] };
  }

  const groups: SettingsCategoryGroup[] = [];
  let page = 1;

  // Guard the loop: `hasNext` is the contract, but never trust a server to stop.
  while (page <= MAX_PAGES) {
    const result = await getSettings(
      { limit: SETTINGS_LIMIT, page },
      { token },
    );

    if (!isApiSuccess(result)) {
      // A partial list is better than no page at all — only bail on page one.
      if (page === 1) throw new Error(result.message);
      break;
    }

    const page1 = toLookup(result.data.itemList);
    Object.assign(lookup, page1.values);

    for (const group of page1.groups) {
      const existing = groups.find((e) => e.category === group.category);
      if (existing) existing.keys.push(...group.keys);
      else groups.push({ ...group });
    }

    if (!result.data.hasNext) break;
    page += 1;
  }

  groups.sort((a, b) => a.category.localeCompare(b.category));

  return { values: lookup, groups };
}

export async function SettingsSection() {
  const session = await getSession();

  // Every settings write route on the backend is admin-guarded.
  const canEdit = hasPermission(
    session?.user.permissions ?? [],
    'dashboard.view:admin',
  );

  let values: SettingValues = {};
  let groups: SettingsCategoryGroup[] = [];
  let loadError: string | undefined;

  try {
    const result = await fetchSettings(session?.accessToken, canEdit);
    values = result.values;
    groups = result.groups;
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'Request failed.';
  }

  return (
    <SettingsPanel
      initialValues={values}
      groups={groups}
      canEdit={canEdit}
      loadError={loadError}
    />
  );
}

export function SettingsSectionSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-10 w-full max-w-md rounded-xl" />
      <Skeleton className="h-72 w-full rounded-xl" />
      <Skeleton className="h-56 w-full rounded-xl" />
    </div>
  );
}
