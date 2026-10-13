import type { AuthPermission, UserRole } from './rbac/permissions';

export type { AuthPermission, UserRole } from './rbac/permissions';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  role: UserRole;
  apiRoles: string[];
  permissions: AuthPermission[];
}
