'use client';

import { PRIVACY_FIELDS } from '@/features/settings/lib/setting-fields';
import { useTranslations } from 'next-intl';
import { SettingsGroup } from './settings-group';

interface PrivacySettingsProps {
  values: Record<string, unknown>;
  setValue: (key: string, value: unknown) => void;
  dirtyKeys: readonly string[];
  canEdit: boolean;
}

/** Backed by the `security` category; there is no `privacy` category. */
export function PrivacySettings({
  values,
  setValue,
  dirtyKeys,
  canEdit,
}: PrivacySettingsProps) {
  const t = useTranslations();

  return (
    <SettingsGroup
      title={t('settings.privacy.title')}
      description={t('settings.privacy.description')}
      fields={PRIVACY_FIELDS}
      values={values}
      setValue={setValue}
      dirtyKeys={dirtyKeys}
      canEdit={canEdit}
    />
  );
}
