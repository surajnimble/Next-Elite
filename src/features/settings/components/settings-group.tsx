'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { SettingField } from '@/features/settings/lib/setting-fields';
import {
  resolveDescription,
  resolveLabel,
} from '@/features/settings/lib/setting-fields';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { SettingFieldControl } from './setting-field-control';
import { SettingRow, SettingRowGroup } from './setting-row';

interface SettingsGroupProps {
  title: string;
  description: string;
  fields: readonly SettingField[];
  values: Record<string, unknown>;
  setValue: (key: string, value: unknown) => void;
  dirtyKeys?: readonly string[];
  canEdit: boolean;
  footer?: ReactNode;
}

export function SettingsGroup({
  title,
  description,
  fields,
  values,
  setValue,
  dirtyKeys = [],
  canEdit,
  footer,
}: SettingsGroupProps) {
  const t = useTranslations();

  return (
    <Card variant="glow">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="px-6">
        <SettingRowGroup>
          {fields.map((field) => (
            <SettingRow
              key={field.key}
              label={resolveLabel(field, t)}
              description={resolveDescription(field, t)}
              disabled={!canEdit}
            >
              <SettingFieldControl
                field={field}
                value={values[field.key]}
                onChange={(next) => setValue(field.key, next)}
                disabled={!canEdit}
                isDirty={dirtyKeys.includes(field.key)}
              />
            </SettingRow>
          ))}
        </SettingRowGroup>

        {footer}
      </CardContent>
    </Card>
  );
}
