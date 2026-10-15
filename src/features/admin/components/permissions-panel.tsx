'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

interface PermissionsPanelProps {
  /** role → permissions, exactly as `GET /admin/getPermissions` returned it. */
  roleList: Record<string, string[]>;
  canManage: boolean;
}

/** `SUPER_ADMIN` → `Super admin`; used only for display. */
function humanizeRole(role: string): string {
  return role
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ');
}

export function PermissionsPanel({
  roleList,
  canManage,
}: PermissionsPanelProps) {
  const t = useTranslations('admin');
  const router = useRouter();

  // Roles come from the API; nothing about which roles exist is hard-coded.
  const roles = useMemo(
    () => Object.entries(roleList).sort(([a], [b]) => a.localeCompare(b)),
    [roleList],
  );

  // Union of every permission across roles — the picker is built from data.
  const allPermissions = useMemo(() => {
    const set = new Set<string>();
    for (const permissions of Object.values(roleList)) {
      for (const permission of permissions) set.add(permission);
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [roleList]);

  const [draft, setDraft] = useState<Record<string, string[]>>({});
  const [openRole, setOpenRole] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: async ({
      role,
      permissions,
    }: {
      role: string;
      permissions: string[];
    }) => {
      const response = await fetch('/api/admin/permissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, permissions }),
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(payload.message || t('actionFailed'));
      }
      return payload;
    },
    onSuccess: () => {
      toast.success(t('permissions.saved'));
      setDraft({});
      router.refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function toggle(role: string, permission: string) {
    const current = draft[role] ?? roleList[role] ?? [];
    const next = current.includes(permission)
      ? current.filter((entry) => entry !== permission)
      : [...current, permission];

    setDraft((currentDraft) => ({ ...currentDraft, [role]: next }));
  }

  return (
    <Card variant="glow">
      <CardHeader>
        <CardTitle>{t('permissions.title')}</CardTitle>
        <CardDescription>
          {t('permissions.description', { count: allPermissions.length })}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {roles.map(([role, permissions]) => {
          const current = draft[role] ?? permissions;
          const isOpen = openRole === role;
          const isDirty = draft[role] !== undefined;
          const isSuperAdmin = current.includes('*');

          return (
            <div key={role} className="rounded-lg border border-border/40">
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-start"
                onClick={() => setOpenRole(isOpen ? null : role)}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="truncate text-sm font-medium text-foreground">
                    {humanizeRole(role)}
                  </span>
                  <code className="font-mono text-xs text-muted-foreground">
                    {role}
                  </code>
                </span>

                <span className="flex shrink-0 items-center gap-2">
                  <Badge variant="outline">
                    {isSuperAdmin
                      ? t('permissions.all')
                      : t('permissions.count', {
                          count: current.length,
                          total: allPermissions.length,
                        })}
                  </Badge>
                  {isDirty ? (
                    <Badge variant="successOutline">
                      {t('permissions.unsaved')}
                    </Badge>
                  ) : null}
                </span>
              </button>

              {isOpen ? (
                <div className="border-t border-border/40 px-4 py-3">
                  {isSuperAdmin ? (
                    <p className="text-sm text-muted-foreground">
                      {t('permissions.superAdminNote')}
                    </p>
                  ) : (
                    <>
                      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {allPermissions.map((permission) => (
                          <li
                            key={permission}
                            className="flex items-center justify-between gap-2 rounded-md border border-border/40 px-3 py-2"
                          >
                            <code className="truncate font-mono text-xs text-foreground">
                              {permission}
                            </code>
                            <Switch
                              checked={current.includes(permission)}
                              disabled={!canManage || save.isPending}
                              onCheckedChange={() => toggle(role, permission)}
                              aria-label={permission}
                            />
                          </li>
                        ))}
                      </ul>

                      {canManage ? (
                        <div className="mt-4 flex items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            disabled={!isDirty || save.isPending}
                            onClick={() =>
                              save.mutate({ role, permissions: current })
                            }
                          >
                            {save.isPending
                              ? t('saving')
                              : t('permissions.save')}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={!isDirty}
                            onClick={() =>
                              setDraft((d) => {
                                const next = { ...d };
                                delete next[role];
                                return next;
                              })
                            }
                          >
                            {t('permissions.discard')}
                          </Button>
                        </div>
                      ) : null}
                    </>
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
