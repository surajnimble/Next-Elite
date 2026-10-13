import type { AuthPermission, UserRole } from './rbac/permissions';

export type { AuthPermission, UserRole } from './rbac/permissions';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  role: UserRole;
  /** Raw role strings returned by the backend API (e.g. `SUPER_ADMIN`). */
  apiRoles: string[];
  permissions: AuthPermission[];
}
