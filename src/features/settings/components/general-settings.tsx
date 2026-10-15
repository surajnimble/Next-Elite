'use client';

import { Switch } from '@/components/ui/switch';
import { setLocaleAction } from '@/features/i18n/locale-actions';
import { GENERAL_FIELDS } from '@/features/settings/lib/setting-fields';
import { usePreferences } from '@/features/settings/lib/preferences';
import { useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { SettingRow, SettingRowGroup } from './setting-row';
import { SettingsGroup } from './settings-group';

interface GeneralSettingsProps {
  values: Record<string, unknown>;
  setValue: (key: string, value: unknown) => void;
  dirtyKeys: readonly string[];
  canEdit: boolean;
}

/**
 * Language is the one backend setting that also has to change the running app,
 * so `locale.default` goes through `setLocaleAction` (a server action that
 * rewrites the locale cookie) in addition to being persisted.
 */
export function GeneralSettings({
  values,
  setValue,
  dirtyKeys,
  canEdit,
}: GeneralSettingsProps) {
  const t = useTranslations();
  const [, startTransition] = useTransition();
  const [preferences, setPreference] = usePreferences();

  const handleSetValue = (key: string, value: unknown) => {
    setValue(key, value);

    if (key === 'locale.default' && typeof value === 'string') {
      startTransition(() => {
        void setLocaleAction(value);
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <SettingsGroup
        title={t('settings.general.title')}
        description={t('settings.general.description')}
        fields={GENERAL_FIELDS}
        values={values}
        setValue={handleSetValue}
        dirtyKeys={dirtyKeys}
        canEdit={canEdit}
      />

      <SettingsGroup
        title={t('settings.workspace.title')}
        description={t('settings.workspace.description')}
        fields={[]}
        values={values}
        setValue={handleSetValue}
        canEdit={canEdit}
        footer={
          <SettingRowGroup>
            <SettingRow
              label={t('settings.fields.autoSave.label')}
              description={t('settings.fields.autoSave.description')}
            >
              <Switch
                checked={preferences.autoSave}
                onCheckedChange={(checked) =>
                  setPreference('autoSave', checked)
                }
                aria-label={t('settings.fields.autoSave.label')}
              />
            </SettingRow>
          </SettingRowGroup>
        }
      />
    </div>
  );
}
