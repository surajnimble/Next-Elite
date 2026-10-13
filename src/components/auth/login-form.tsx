'use client';

import TextLink from '@/components/shared/text-link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { useAuth } from '@/features/auth/hooks/auth-provider';
import { getDeviceData } from '@/features/auth/lib/device';
import { loginSchema, type LoginInput } from '@/features/auth/schemas/login';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

const LoginForm = () => {
  const t = useTranslations('auth.login');
  const tToast = useTranslations('auth.toast');
  const locale = useLocale();
  const router = useRouter();
  const { signIn, user, isLoading } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setServerError(null);
    try {
      const { message } = await signIn({
        email: values.email,
        password: values.password,
        deviceData: getDeviceData(locale),
      });
      toast.success(message ?? tToast('loginSuccess'));
      router.replace('/dashboard');
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t('invalidCredentials');
      setServerError(message);
      toast.error(message);
      form.setValue('password', '');
    }
  });

  if (!isLoading && user) return null;

  const emailError = form.formState.errors.email?.message;
  const passwordError = form.formState.errors.password?.message;

  return (
    <div className="flex w-full items-center justify-center py-4">
      <Card
        flat
        className="w-full max-w-md border-0 bg-transparent pb-10 shadow-none"
      >
        <CardHeader className="flex flex-row items-center justify-center px-4">
          <CardTitle className="text-center text-2xl">{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-4 sm:gap-6"
            onSubmit={onSubmit}
            noValidate
          >
            <div className="grid gap-4 sm:gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  tabIndex={1}
                  placeholder="email@example.com"
                  aria-invalid={!!emailError}
                  {...form.register('email')}
                />
                <InputError message={emailError} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">{t('password')}</Label>
                <PasswordInput
                  id="password"
                  autoComplete="current-password"
                  tabIndex={2}
                  placeholder={t('passwordPlaceholder')}
                  aria-invalid={!!passwordError}
                  {...form.register('password')}
                />
                <InputError message={passwordError} />
              </div>

              {serverError && (
                <p className="text-sm text-destructive" role="alert">
                  {serverError}
                </p>
              )}

              <TextLink
                href="/password-reset"
                className="ms-auto text-xs text-primary sm:text-sm"
                tabIndex={4}
              >
                {t('forgotPassword')}
              </TextLink>

              <Button
                type="submit"
                tabIndex={3}
                loading={form.formState.isSubmitting}
              >
                {t('submit')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
