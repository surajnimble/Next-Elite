import PasswordResetForm from '@/components/auth/password-reset-form';
import { getCurrentUser } from '@/features/auth/server/session';
import { redirect } from 'next/navigation';

export default async function PasswordResetPage() {
  const user = await getCurrentUser();
  if (user) redirect('/');

  return <PasswordResetForm />;
}
