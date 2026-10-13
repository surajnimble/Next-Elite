import type { AuthPermission, UserRole } from './permissions';

const ROLE_PERMISSIONS = {
  user: ['dashboard.view:user'],
  admin: ['dashboard.view:user', 'dashboard.view:admin'],
} as const satisfies Record<UserRole, readonly AuthPermission[]>;

export function getPermissionsForRole(role: UserRole): AuthPermission[] {
  return [...ROLE_PERMISSIONS[role]];
}

/**
 * Maps the role strings returned by the backend API onto this app's coarse
 * `UserRole`. Any role containing `ADMIN` (case-insensitive) is treated as an
 * admin; everything else falls back to `user`.
 */
export function getRoleFromApiRoles(roles: readonly string[]): UserRole {
  return roles.some((role) => role.toUpperCase().includes('ADMIN'))
    ? 'admin'
    : 'user';
}
