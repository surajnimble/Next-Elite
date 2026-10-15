'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useSystemSettings,
  type SettingValues,
} from '@/features/settings/hooks/use-system-settings';
import {
  GENERAL_FIELDS,
  NOTIFICATION_FIELDS,
  PRIVACY_FIELDS,
  STORAGE_FIELDS,
  type SettingsTabId,
} from '@/features/settings/lib/setting-fields';
import { usePreferences } from '@/features/settings/lib/preferences';
import { cn } from '@/libs/utils';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { AppearanceSettings } from './appearance-settings';
import { AllSettings, type SettingsCategoryGroup } from './all-settings';
import { GeneralSettings } from './general-settings';
import { NotificationSettings } from './notification-settings';
import { PrivacySettings } from './privacy-settings';
import { StorageSettings } from './storage-settings';

interface SettingsPanelProps {
  initialValues: SettingValues;
  groups: SettingsCategoryGroup[];
  /** False for regular users — the backend guards every settings route as admin. */
  canEdit: boolean;
  loadError?: string;
}

const TABS: readonly SettingsTabId[] = [
  'general',
  'appearance',
  'notifications',
  'privacy',
  'storage',
  'all',
];

function selectKeys(fields: readonly { key: string }[]): string[] {
  return fields.map((field) => field.key);
}

export function SettingsPanel({
  initialValues,
  groups,
  canEdit,
  loadError,
}: SettingsPanelProps) {
  const t = useTranslations();
  const [preferences] = usePreferences();

  const {
    values,
    setValue,
    saveChanges,
    discardChanges,
    dirtyKeys,
    isDirty,
    isSaving,
  } = useSystemSettings({
    initialValues,
    canEdit,
    autoSave: preferences.autoSave,
  });

  // Only the keys the tabs actually render need to reach the browser.
  const scopedValues = useMemo<SettingValues>(() => {
    const keys = [
      ...selectKeys(GENERAL_FIELDS),
      ...selectKeys(NOTIFICATION_FIELDS),
      ...selectKeys(PRIVACY_FIELDS),
      ...selectKeys(STORAGE_FIELDS),
    ];

    const scoped: SettingValues = {};
    for (const key of keys) {
      if (key in values) scoped[key] = values[key];
    }
    return scoped;
  }, [values]);

  if (loadError) {
    return (
      <Alert className="border-destructive/40 bg-destructive/5">
        <AlertTitle className="text-destructive">{loadError}</AlertTitle>
        <AlertDescription>{t('settings.loadError')}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Tabs defaultValue="general" className="gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabsList className="h-auto w-full max-w-full flex-wrap justify-start gap-1 bg-transparent p-0">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className={cn(
                'h-9 flex-none rounded-md border border-transparent px-3 text-sm font-medium',
                'data-[state=active]:border-border data-[state=active]:bg-card',
              )}
            >
              {t(`settings.tabs.${tab}`)}
            </TabsTrigger>
          ))}
        </TabsList>

        {!canEdit && preferences.autoSave ? (
          <p className="text-xs text-muted-foreground">
            {t('settings.readOnly')}
          </p>
        ) : null}

        {!preferences.autoSave ? (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={!isDirty || isSaving}
              onClick={discardChanges}
            >
              {t('settings.discard')}
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!isDirty || isSaving || !canEdit}
              onClick={saveChanges}
            >
              {isSaving ? t('settings.saving') : t('settings.save')}
            </Button>
          </div>
        ) : null}
      </div>

      <TabsContent value="general">
        <GeneralSettings
          values={scopedValues}
          setValue={setValue}
          dirtyKeys={dirtyKeys}
          canEdit={canEdit}
        />
      </TabsContent>

      <TabsContent value="appearance">
        <AppearanceSettings />
      </TabsContent>

      <TabsContent value="notifications">
        {canEdit ? (
          <NotificationSettings
            values={scopedValues}
            setValue={setValue}
            dirtyKeys={dirtyKeys}
            canEdit={canEdit}
          />
        ) : (
          <AdminOnlyNotice />
        )}
      </TabsContent>

      <TabsContent value="privacy">
        {canEdit ? (
          <PrivacySettings
            values={scopedValues}
            setValue={setValue}
            dirtyKeys={dirtyKeys}
            canEdit={canEdit}
          />
        ) : (
          <AdminOnlyNotice />
        )}
      </TabsContent>

      <TabsContent value="storage">
        <StorageSettings
          values={scopedValues}
          setValue={setValue}
          dirtyKeys={dirtyKeys}
          canEdit={canEdit}
        />
      </TabsContent>

      {/* Driven by the rows the API returned, not the curated catalogue, so no
          backend key can be missing here. Needs the *full* value map. */}
      <TabsContent value="all">
        {canEdit ? (
          <AllSettings
            values={values}
            setValue={setValue}
            dirtyKeys={dirtyKeys}
            canEdit={canEdit}
            groups={groups}
          />
        ) : (
          <AdminOnlyNotice />
        )}
      </TabsContent>
    </Tabs>
  );
}

/** Those keys are all `isPublic: false`, so a regular user cannot read them. */
function AdminOnlyNotice() {
  const t = useTranslations();

  return (
    <Card variant="glow">
      <CardHeader>
        <CardTitle>{t('settings.adminOnly.title')}</CardTitle>
        <CardDescription>{t('settings.adminOnly.description')}</CardDescription>
      </CardHeader>
    </Card>
  );
}
