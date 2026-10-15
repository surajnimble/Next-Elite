'use client';

import { Icon, type IconName } from '@/components/icons/app-icons';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/components/shared/theme-provider';
import {
  usePreferences,
  type Density,
} from '@/features/settings/lib/preferences';
import { useTranslations } from 'next-intl';
import { SettingRow, SettingRowGroup } from './setting-row';

type ThemeValue = 'light' | 'dark' | 'system';

const THEMES: { value: ThemeValue; icon: IconName }[] = [
  { value: 'light', icon: 'sun' },
  { value: 'dark', icon: 'moon' },
  { value: 'system', icon: 'settings' },
];

const DENSITIES: Density[] = ['comfortable', 'compact'];

export function AppearanceSettings() {
  const t = useTranslations();
  const { theme, setTheme } = useTheme();
  const [preferences, setPreference] = usePreferences();

  return (
    <div className="flex flex-col gap-4">
      <Card variant="glow">
        <CardHeader>
          <CardTitle>{t('settings.appearance.title')}</CardTitle>
          <CardDescription>
            {t('settings.appearance.description')}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6">
          <SettingRowGroup>
            <SettingRow
              label={t('settings.fields.theme.label')}
              description={t('settings.fields.theme.description')}
            >
              <div className="flex items-center gap-1.5">
                {THEMES.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    size="icon"
                    variant={theme === option.value ? 'default' : 'outline'}
                    aria-label={t(`settings.themes.${option.value}`)}
                    title={t(`settings.themes.${option.value}`)}
                    onClick={(event) =>
                      setTheme(option.value, {
                        x: event.clientX,
                        y: event.clientY,
                      })
                    }
                  >
                    <Icon name={option.icon} className="size-4" />
                  </Button>
                ))}
              </div>
            </SettingRow>

            <SettingRow
              label={t('settings.fields.density.label')}
              description={t('settings.fields.density.description')}
            >
              <div className="flex items-center gap-1.5">
                {DENSITIES.map((option) => (
                  <Button
                    key={option}
                    type="button"
                    size="sm"
                    variant={
                      preferences.density === option ? 'default' : 'outline'
                    }
                    onClick={() => setPreference('density', option)}
                  >
                    {t(`settings.densities.${option}`)}
                  </Button>
                ))}
              </div>
            </SettingRow>

            <SettingRow
              label={t('settings.fields.sidebarCollapsed.label')}
              description={t('settings.fields.sidebarCollapsed.description')}
            >
              <Switch
                checked={preferences.sidebarCollapsed}
                onCheckedChange={(checked) =>
                  setPreference('sidebarCollapsed', checked)
                }
                aria-label={t('settings.fields.sidebarCollapsed.label')}
              />
            </SettingRow>

            <SettingRow
              label={t('settings.fields.reduceMotion.label')}
              description={t('settings.fields.reduceMotion.description')}
            >
              <Switch
                checked={preferences.reduceMotion}
                onCheckedChange={(checked) =>
                  setPreference('reduceMotion', checked)
                }
                aria-label={t('settings.fields.reduceMotion.label')}
              />
            </SettingRow>
          </SettingRowGroup>
        </CardContent>
      </Card>
    </div>
  );
}
