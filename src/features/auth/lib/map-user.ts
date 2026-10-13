import { getPermissionsForRole, getRoleFromApiRoles } from '../rbac/roles';
import type { AuthUser } from '../types';

/** Shape of `result.userData` returned by `POST /api/v1/auth/login`. */
export interface ApiUserData {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role: string;
  isActive?: boolean;
  rolesList?: string[];
  [key: string]: unknown;
}

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
      : userData.rolesList && userData.rolesList.length > 0
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
