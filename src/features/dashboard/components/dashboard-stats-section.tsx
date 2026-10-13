import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getSession } from '@/features/auth/server/session';
import { getTranslations } from 'next-intl/server';
import { getDashboardStats } from '../server/api';
import { DashboardStatsGrid } from './dashboard-stats-grid';

/**
 * Server component that loads the platform dashboard metrics and renders them
 * as a grid of stat cards, falling back to an inline error message on failure.
 */
export async function DashboardStatsSection() {
  const [session, t] = await Promise.all([
    getSession(),
    getTranslations('dashboard.stats'),
  ]);

  try {
    const stats = await getDashboardStats(session?.accessToken);
    return <DashboardStatsGrid stats={stats} />;
  } catch {
    return (
      <Alert className="border-destructive/40 bg-destructive/5">
        <AlertTitle className="text-destructive">{t('errorTitle')}</AlertTitle>
        <AlertDescription>{t('errorDescription')}</AlertDescription>
      </Alert>
    );
  }
}
