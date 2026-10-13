import {
  getPermissionsForRole,
  getRoleFromApiRoles,
} from '@/features/auth/rbac/roles';
import { describe, expect, it } from 'vitest';

describe('roles', () => {
  it('resolves the admin role from an admin API role string', () => {
    expect(getRoleFromApiRoles(['SUPER_ADMIN'])).toBe('admin');
  });

  it('falls back to the user role when no API role contains ADMIN', () => {
    expect(getRoleFromApiRoles(['USER'])).toBe('user');
  });

  it('returns user permissions for the user role', () => {
    expect(getPermissionsForRole('user')).toContain('dashboard.view:user');
    expect(getPermissionsForRole('user')).not.toContain('dashboard.view:admin');
  });

  it('returns admin permissions for the admin role', () => {
    expect(getPermissionsForRole('admin')).toContain('dashboard.view:admin');
    expect(getPermissionsForRole('admin')).toContain('dashboard.view:user');
  });
});
