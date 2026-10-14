import { getPermissionsForRole, getRoleFromApiRoles } from '../rbac/roles';
import type { AuthUser } from '../types';
import type { ApiUserData } from '@/libs/models';

/**
 * Transforms the backend `userData` payload into the app's `AuthUser` model.
 *
 * Role priority: the top-level `rolesList`, then `userData.rolesList`, then the
 * single `userData.role`.
 */
export function buildAuthUser(
  userData: ApiUserData,
  rolesList?: readonly string[],
): AuthUser {
  const apiRoles =
    rolesList && rolesList.length > 0
      ? [...rolesList]
      : userData.rolesList?.length
        ? [...userData.rolesList]
        : [userData.role];

  const role = getRoleFromApiRoles(apiRoles);

  return {
    id: userData.userId || userData.email,
    name: userData.name || userData.email,
    email: userData.email,
    phone: userData.phone ?? '',
    avatarUrl: userData.avatarUrl ?? '',
    role,
    apiRoles,
    permissions: getPermissionsForRole(role),
  };
}
