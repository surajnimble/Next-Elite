'use client';

import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type {
  OptionLabelKey,
  SettingField,
  SelectOption,
} from '@/features/settings/lib/setting-fields';
import {
  resolveDescription,
  resolveLabel,
} from '@/features/settings/lib/setting-fields';
import { useTranslations } from 'next-intl';

/**
 * The backend stores every setting as JSON, so a value arriving from the wire
 * can be any shape. These narrow it without throwing.
 */
function asBoolean(value: unknown): boolean {
  return value === true || value === 'true';
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === 'string')
    : [];
}

function asNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function optionText(
  option: SelectOption,
  t: (key: OptionLabelKey) => string,
): string {
  return 'text' in option ? option.text : t(option.label);
}

interface SettingFieldControlProps {
  field: SettingField;
  value: unknown;
  onChange: (value: unknown) => void;
  disabled?: boolean;
  /** When false the current value is kept but shown as not-applied. */
  isDirty?: boolean;
}

export function SettingFieldControl({
  field,
  value,
  onChange,
  disabled = false,
  isDirty = false,
}: SettingFieldControlProps) {
  const t = useTranslations();

  const label = resolveLabel(field, t);
  const description = resolveDescription(field, t);

  const dirtyClass = isDirty ? 'ring-2 ring-primary/40' : undefined;

  if (field.kind === 'toggle') {
    return (
      <Switch
        checked={asBoolean(value)}
        disabled={disabled}
        onCheckedChange={(checked) => onChange(checked)}
        aria-label={label}
        title={description}
        className={dirtyClass}
      />
    );
  }

  if (field.kind === 'select') {
    return (
      <Select
        value={asString(value)}
        disabled={disabled}
        onValueChange={(next) => onChange(next)}
      >
        <SelectTrigger
          className={`w-56 ${dirtyClass}`}
          aria-label={label}
          title={description}
        >
          <SelectValue placeholder={t('settings.selectPlaceholder')} />
        </SelectTrigger>
        <SelectContent>
          {field.options.map((option: SelectOption) => (
            <SelectItem key={option.value} value={option.value}>
              {optionText(option, t)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (field.kind === 'list') {
    const selected = asStringArray(value);

    return (
      <div className="flex flex-wrap justify-end gap-2">
        {field.options.map((option: SelectOption) => {
          const active = selected.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              disabled={disabled}
              aria-pressed={active}
              onClick={() =>
                onChange(
                  active
                    ? selected.filter((entry) => entry !== option.value)
                    : [...selected, option.value],
                )
              }
              className={
                active
                  ? 'rounded-full'
                  : 'rounded-full opacity-60 hover:opacity-100'
              }
            >
              <Badge
                variant={active ? 'default' : 'outline'}
                className="cursor-pointer"
              >
                {optionText(option, t)}
              </Badge>
            </button>
          );
        })}
      </div>
    );
  }

  if (field.kind === 'number') {
    return (
      <Input
        type="number"
        inputMode="numeric"
        className={`w-32 ${dirtyClass}`}
        value={Number.isFinite(asNumber(value)) ? String(asNumber(value)) : ''}
        min={field.min}
        max={field.max}
        step={field.step ?? 1}
        disabled={disabled}
        aria-label={label}
        title={description}
        onChange={(event) => {
          const next = Number(event.target.value);
          if (!Number.isFinite(next)) return;
          const clamped = Math.min(
            Math.max(next, field.min ?? Number.NEGATIVE_INFINITY),
            field.max ?? Number.POSITIVE_INFINITY,
          );
          onChange(clamped);
        }}
      />
    );
  }

  if (field.kind === 'text') {
    return (
      <Input
        className={`w-72 ${dirtyClass}`}
        value={asString(value)}
        disabled={disabled}
        aria-label={label}
        title={description}
        placeholder={field.placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  if (field.kind === 'json') {
    return (
      <code
        className="block max-w-72 truncate rounded-md bg-muted px-2 py-1 font-mono text-xs text-muted-foreground"
        aria-label={label}
        title={JSON.stringify(value ?? null, null, 2)}
      >
        {JSON.stringify(value ?? null)}
      </code>
    );
  }

  return (
    <span className="max-w-72 truncate text-sm text-muted-foreground tabular-nums">
      {String(value ?? '—')}
    </span>
  );
}
