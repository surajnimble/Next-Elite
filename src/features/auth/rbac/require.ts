import { redirect } from 'next/navigation';
import { getCurrentUser } from '../server/session';
import type { AuthUser } from '../types';
import { hasPermission } from './can';
import type { AuthPermission } from './permissions';

export async function requireUser(redirectTo = '/'): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) redirect(redirectTo);
  return user;
}

export async function requirePermission(
  permission: AuthPermission,
  redirectTo = '/unauthorized',
): Promise<AuthUser> {
  const user = await requireUser();
  if (!hasPermission(user.permissions, permission)) redirect(redirectTo);
  return user;
}
