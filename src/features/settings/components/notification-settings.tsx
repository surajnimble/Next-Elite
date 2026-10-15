'use client';

import { NOTIFICATION_FIELDS } from '@/features/settings/lib/setting-fields';
import { useTranslations } from 'next-intl';
import { SettingsGroup } from './settings-group';

interface NotificationSettingsProps {
  values: Record<string, unknown>;
  setValue: (key: string, value: unknown) => void;
  dirtyKeys: readonly string[];
  canEdit: boolean;
}

export function NotificationSettings({
  values,
  setValue,
  dirtyKeys,
  canEdit,
}: NotificationSettingsProps) {
  const t = useTranslations();

  return (
    <SettingsGroup
      title={t('settings.notifications.title')}
      description={t('settings.notifications.description')}
      fields={NOTIFICATION_FIELDS}
      values={values}
      setValue={setValue}
      dirtyKeys={dirtyKeys}
      canEdit={canEdit}
    />
  );
}
