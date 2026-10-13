import LoginForm from '@/components/auth/login-form';
import { getCurrentUser } from '@/features/auth/server/session';
import { redirect } from 'next/navigation';

const AuthHomePage = async () => {
  const user = await getCurrentUser();
  if (user) redirect('/dashboard');

  return <LoginForm />;
};

export default AuthHomePage;
