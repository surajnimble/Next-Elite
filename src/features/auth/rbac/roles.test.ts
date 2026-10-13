import { describe, expect, it } from 'vitest';

import { getPermissionsForRole, getRoleFromApiRoles } from './roles';

describe('roles', () => {
  describe('getPermissionsForRole', () => {
    it('returns both user and admin permissions for admin role', () => {
      const perms = getPermissionsForRole('admin');
      expect(perms).toEqual(['dashboard.view:user', 'dashboard.view:admin']);
    });

    it('returns only user permissions for user role', () => {
      const perms = getPermissionsForRole('user');
      expect(perms).toEqual(['dashboard.view:user']);
    });

    it('returns a new array each call (immutability)', () => {
      const a = getPermissionsForRole('admin');
      const b = getPermissionsForRole('admin');
      expect(a).not.toBe(b);
      expect(a).toEqual(b);
    });
  });

  describe('getRoleFromApiRoles', () => {
    it('returns admin for an admin API role', () => {
      expect(getRoleFromApiRoles(['SUPER_ADMIN'])).toBe('admin');
    });

    it('matches the ADMIN substring case-insensitively', () => {
      expect(getRoleFromApiRoles(['org_admin'])).toBe('admin');
    });

    it('returns user for non-admin roles', () => {
      expect(getRoleFromApiRoles(['USER'])).toBe('user');
      expect(getRoleFromApiRoles(['VENDOR'])).toBe('user');
    });

    it('returns user when the list is empty', () => {
      expect(getRoleFromApiRoles([])).toBe('user');
    });

    it('returns admin when any role in the list is an admin role', () => {
      expect(getRoleFromApiRoles(['USER', 'SUPER_ADMIN'])).toBe('admin');
    });
  });
});
