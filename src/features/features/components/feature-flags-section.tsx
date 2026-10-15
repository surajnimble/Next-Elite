import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { getSession } from '@/features/auth/server/session';
import { FeatureFlagList } from '@/features/features/components/feature-flag-list';
import { FeatureStats } from '@/features/features/components/feature-stats';
import { summarise } from '@/features/features/lib/feature-flags';
import { getFeatureFlags, isApiSuccess } from '@/libs/api';
import { getTranslations } from 'next-intl/server';

export async function FeatureFlagsSection({ canEdit }: { canEdit: boolean }) {
  const [session, t] = await Promise.all([
    getSession(),
    getTranslations('features'),
  ]);

  const result = await getFeatureFlags({ token: session?.accessToken });

  if (!isApiSuccess(result)) {
    return (
      <Alert className="border-destructive/40 bg-destructive/5">
        <AlertTitle className="text-destructive">{result.message}</AlertTitle>
        <AlertDescription>{t('loadError')}</AlertDescription>
      </Alert>
    );
  }

  // The map is whatever the backend holds — nothing is filtered or hard-coded.
  return (
    <div className="flex flex-col gap-6">
      <FeatureStats summary={summarise(result.data)} />

      <FeatureFlagList flags={result.data} canEdit={canEdit} />
    </div>
  );
}

export function FeatureFlagsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-31.5 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-96 w-full rounded-xl" />
    </div>
  );
}
