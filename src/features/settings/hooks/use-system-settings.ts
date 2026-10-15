'use client';

import { useMutation } from '@tanstack/react-query';
import type { UpdateSettingRequest } from '@/libs/models';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export type SettingValues = Record<string, unknown>;

export interface UseSystemSettingsOptions {
  initialValues?: SettingValues;
  /** Regular users can read but not write — the backend guards are admin-only. */
  canEdit: boolean;
  autoSave: boolean;
}

const AUTO_SAVE_DELAY_MS = 600;

interface UseSystemSettingsResult {
  values: SettingValues;
  setValue: (key: string, value: unknown) => void;
  saveChanges: () => void;
  discardChanges: () => void;
  dirtyKeys: string[];
  isDirty: boolean;
  isSaving: boolean;
}

/**
 * Settings live in the backend, but the access token only ever exists in the
 * httpOnly session cookie — so the browser cannot call the API layer directly.
 * Every write goes through `PATCH /api/admin/settings`, which unwraps to
 * `bulkUpdateSettings()` on the server.
 */
export function useSystemSettings({
  initialValues,
  canEdit,
  autoSave,
}: UseSystemSettingsOptions): UseSystemSettingsResult {
  const t = useTranslations('settings');
  const server = initialValues ?? {};

  /**
   * `written` is what the backend has confirmed, overlaid on the values the
   * server rendered. It must survive a successful save: clearing it would drop
   * the UI back to the stale server render and make every save look like it
   * reverted. `staged` holds edits that have not been persisted yet.
   */
  const [written, setWritten] = useState<SettingValues>({});
  const [staged, setStaged] = useState<SettingValues>({});
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const save = useMutation({
    mutationFn: async (settings: UpdateSettingRequest[]) => {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });

      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(payload.message || t('saveFailed'));
      }
      return payload;
    },
    onSuccess: (_data, settings) => {
      const confirmed: SettingValues = {};
      for (const { key, value } of settings) confirmed[key] = value;

      setWritten((current) => ({ ...current, ...confirmed }));
      setStaged({});
      toast.success(t('saved'));
    },
    onError: (error: Error) => {
      // Drop the un-persisted edits rather than showing a value the API rejected.
      setStaged({});
      toast.error(error.message);
    },
  });

  const persist = useCallback(
    (entries: SettingValues) => {
      const settings = Object.entries(entries).map(([key, value]) => ({
        key,
        value,
      }));

      if (settings.length === 0) return;
      save.mutate(settings);
    },
    [save],
  );

  // A fresh server render replaces the baseline.
  useEffect(() => {
    setWritten({});
    setStaged({});
  }, [initialValues]);

  // Drop pending timers on unmount so nothing fires into a dead tree.
  useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const timer of pending.values()) clearTimeout(timer);
      pending.clear();
    };
  }, []);

  const setValue = useCallback(
    (key: string, value: unknown) => {
      if (!canEdit) return;

      setStaged((current) => ({ ...current, [key]: value }));

      if (!autoSave) return;

      const pending = timers.current;
      const existing = pending.get(key);
      if (existing) clearTimeout(existing);

      pending.set(
        key,
        setTimeout(() => {
          pending.delete(key);
          persist({ [key]: value });
        }, AUTO_SAVE_DELAY_MS),
      );
    },
    [autoSave, canEdit, persist],
  );

  const saveChanges = useCallback(() => {
    const pending = timers.current;
    for (const timer of pending.values()) clearTimeout(timer);
    pending.clear();
    persist(staged);
  }, [persist, staged]);

  const discardChanges = useCallback(() => {
    const pending = timers.current;
    for (const timer of pending.values()) clearTimeout(timer);
    pending.clear();
    setStaged({});
  }, []);

  const dirtyKeys = Object.keys(staged);

  return {
    values: { ...server, ...written, ...staged },
    setValue,
    saveChanges,
    discardChanges,
    dirtyKeys,
    isDirty: dirtyKeys.length > 0,
    isSaving: save.isPending,
  };
}
