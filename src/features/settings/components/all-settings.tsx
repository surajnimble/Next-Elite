'use client';

import { Icon } from '@/components/icons/app-icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  CATEGORY_TITLE_KEYS,
  describeField,
  humanizeKey,
  isSettingsCategory,
  resolveLabel,
  type SettingsCategory,
} from '@/features/settings/lib/setting-fields';
import type { SettingValues } from '@/features/settings/hooks/use-system-settings';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { SettingFieldControl } from './setting-field-control';
import { SettingRow, SettingRowGroup } from './setting-row';

export interface SettingsCategoryGroup {
  category: string;
  keys: string[];
}

interface AllSettingsProps {
  values: SettingValues;
  setValue: (key: string, value: unknown) => void;
  dirtyKeys: readonly string[];
  canEdit: boolean;
  /**
   * Built from the rows the API actually returned rather than a hard-coded
   * list, so a new backend key shows up here without touching this file.
   */
  groups: SettingsCategoryGroup[];
}

/**
 * `CATEGORY_TITLE_KEYS` points at each category's `.title` leaf, so this stays
 * type-checked — no cast. Passing `categories.<name>` on its own resolves to an
 * **object**, which is what threw next-intl's `INSUFFICIENT_PATH`. Takes the
 * `settings`-scoped translator because the root union is too wide to represent.
 */
function categoryTitle(
  t: ReturnType<typeof useTranslations<'settings'>>,
  category: string,
): string {
  if (category === 'other') return t('all.unknownCategory');
  if (!isSettingsCategory(category)) return humanizeKey(category);

  return t(CATEGORY_TITLE_KEYS[category]);
}

export function AllSettings({
  values,
  setValue,
  dirtyKeys,
  canEdit,
  groups,
}: AllSettingsProps) {
  // `rootT` is only for the curated field labels, keyed as `settings.fields.*`.
  const t = useTranslations('settings');
  const rootT = useTranslations();
  const [term, setTerm] = useState('');

  const total = groups.reduce((sum, group) => sum + group.keys.length, 0);

  const visible = useMemo(() => {
    const needle = term.trim().toLowerCase();
    if (!needle) return groups;

    return groups
      .map((group) => ({
        ...group,
        keys: group.keys.filter(
          (key) =>
            key.toLowerCase().includes(needle) ||
            humanizeKey(key).toLowerCase().includes(needle) ||
            group.category.toLowerCase().includes(needle),
        ),
      }))
      .filter((group) => group.keys.length > 0);
  }, [groups, term]);

  const shown = visible.reduce((sum, group) => sum + group.keys.length, 0);

  return (
    <div className="flex flex-col gap-4">
      <Card variant="glow">
        <CardHeader>
          <CardTitle>{t('all.title')}</CardTitle>
          <CardDescription>
            {t('all.description')} {t('all.showing', { count: shown, total })}
          </CardDescription>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <div className="relative min-w-48 flex-1">
              <Icon
                name="search"
                className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder={t('all.searchPlaceholder')}
                aria-label={t('all.searchLabel')}
                className="ps-9"
              />
            </div>

            {term ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setTerm('')}
              >
                {t('all.clear')}
              </Button>
            ) : null}
          </div>
        </CardHeader>

        <CardContent className="px-6">
          {visible.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {t('all.noResultsFor', { term: term.trim() })}
            </p>
          ) : (
            <div className="flex flex-col gap-6">
              {visible.map((group) => (
                <section key={group.category} className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">
                      {categoryTitle(t, group.category)}
                    </h3>
                    <Badge variant="outline">
                      {t('all.categoryCount', {
                        count: group.keys.length,
                      })}
                    </Badge>
                    {group.category !== 'other' ? (
                      <code className="font-mono text-[0.7rem] text-muted-foreground">
                        {group.category as SettingsCategory}
                      </code>
                    ) : null}
                  </div>

                  <SettingRowGroup className="rounded-lg border border-border/40 px-4">
                    {group.keys.map((key) => {
                      const field = describeField(key, values[key]);

                      return (
                        <SettingRow
                          key={key}
                          label={resolveLabel(field, rootT)}
                          description={key}
                          disabled={!canEdit}
                        >
                          <SettingFieldControl
                            field={field}
                            value={values[key]}
                            onChange={(next) => setValue(key, next)}
                            disabled={!canEdit}
                            isDirty={dirtyKeys.includes(key)}
                          />
                        </SettingRow>
                      );
                    })}
                  </SettingRowGroup>
                </section>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
