import { describe, expect, it } from 'vitest';

import { buildAuthUser, type ApiUserData } from './map-user';

const baseUser: ApiUserData = {
  userId: 'user_1',
  name: 'Super Admin',
  email: 'superadmin@projectname.com',
  role: 'SUPER_ADMIN',
};

describe('buildAuthUser', () => {
  it('maps an admin API role to the admin role with admin permissions', () => {
    const user = buildAuthUser(baseUser);
    expect(user.role).toBe('admin');
    expect(user.permissions).toContain('dashboard.view:admin');
    expect(user.permissions).toContain('dashboard.view:user');
  });

  it('falls back to the user role for non-admin roles', () => {
    const user = buildAuthUser({ ...baseUser, role: 'USER' });
    expect(user.role).toBe('user');
    expect(user.permissions).toEqual(['dashboard.view:user']);
  });

  it('prefers the provided rolesList over the single role field', () => {
    const user = buildAuthUser({ ...baseUser, role: 'USER' }, ['SUPER_ADMIN']);
    expect(user.apiRoles).toEqual(['SUPER_ADMIN']);
    expect(user.role).toBe('admin');
  });

  it('falls back to userData.rolesList when no list is passed', () => {
    const user = buildAuthUser({
      ...baseUser,
      role: 'USER',
      rolesList: ['VENDOR_ADMIN'],
    });
    expect(user.role).toBe('admin');
  });

  it('copies profile fields and defaults the optional ones', () => {
    const user = buildAuthUser({
      ...baseUser,
      phone: '8607582826',
      avatarUrl: 'https://cdn.example.com/a.png',
    });
    expect(user).toMatchObject({
      id: 'user_1',
      name: 'Super Admin',
      email: 'superadmin@projectname.com',
      phone: '8607582826',
      avatarUrl: 'https://cdn.example.com/a.png',
    });
  });

  it('defaults phone and avatarUrl to empty strings', () => {
    const user = buildAuthUser(baseUser);
    expect(user.phone).toBe('');
    expect(user.avatarUrl).toBe('');
  });
});
