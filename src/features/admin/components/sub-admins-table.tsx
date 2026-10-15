'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useMutation } from '@tanstack/react-query';
import type { PaginatedResult, SubAdminItem } from '@/libs/models';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ImpersonateDialog } from './impersonate-dialog';
import { SubAdminDialog } from './sub-admin-dialog';

interface SubAdminsTableProps {
  admins: SubAdminItem[];
  pagination: PaginatedResult;
  /** Union of every permission any role has, straight from the API. */
  availablePermissions: string[];
  canManage: boolean;
  /** Impersonation is super-admin-only, so it is shown separately. */
  canImpersonate?: boolean;
}

function initials(name: string, email: string): string {
  const parts = (name || email).split(/\s+/).filter(Boolean);
  if (parts.length > 1) {
    return parts
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase();
  }
  return (parts[0]?.slice(0, 2) ?? 'A').toUpperCase();
}

export function SubAdminsTable({
  admins,
  pagination,
  availablePermissions,
  canManage,
  canImpersonate = false,
}: SubAdminsTableProps) {
  const t = useTranslations('admin');
  const locale = useLocale();
  const router = useRouter();

  const [term, setTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SubAdminItem | null>(null);
  const [pendingDelete, setPendingDelete] = useState<SubAdminItem | null>(null);
  const [impersonating, setImpersonating] = useState<SubAdminItem | null>(null);

  // The API paginates but does not filter, so narrow the current page only.
  const visible = useMemo(() => {
    const needle = term.trim().toLowerCase();
    if (!needle) return admins;

    return admins.filter(
      (admin) =>
        admin.name.toLowerCase().includes(needle) ||
        admin.email.toLowerCase().includes(needle),
    );
  }, [admins, term]);

  const call = useMutation({
    mutationFn: async ({
      path,
      method,
      body,
    }: {
      path: string;
      method: string;
      body?: unknown;
    }) => {
      const response = await fetch(path, {
        method,
        headers: { 'Content-Type': 'application/json' },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(payload.message || t('actionFailed'));
      }
      return payload;
    },
    onSuccess: () => {
      toast.success(t('updated'));
      router.refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const dateFormat = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' });

  const goToPage = (next: number) =>
    router.push(next > 1 ? `/admins?page=${next}` : '/admins');

  const from = admins.length
    ? (pagination.currentPage - 1) * pagination.limit + 1
    : 0;
  const to = from + admins.length - 1;

  return (
    <>
      <Card variant="glow">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1.5">
              <CardTitle>{t('team.title')}</CardTitle>
              <CardDescription>
                {t('team.description', { total: pagination.totalRecord })}
              </CardDescription>
            </div>

            {canManage ? (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setEditing(null);
                  setDialogOpen(true);
                }}
              >
                {t('createAction')}
              </Button>
            ) : null}
          </div>

          <div className="relative mt-4 min-w-48">
            <Input
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder={t('team.searchPlaceholder')}
              aria-label={t('team.searchPlaceholder')}
            />
          </div>
        </CardHeader>

        <CardContent>
          {visible.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              {admins.length === 0 ? t('team.empty') : t('team.noMatch')}
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('fields.name')}</TableHead>
                    <TableHead>{t('fields.email')}</TableHead>
                    <TableHead>{t('fields.role')}</TableHead>
                    <TableHead>{t('team.status')}</TableHead>
                    <TableHead>{t('team.joined')}</TableHead>
                    {canManage ? (
                      <TableHead className="text-end">
                        {t('team.actions')}
                      </TableHead>
                    ) : null}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.map((admin) => (
                    <TableRow key={admin.userId}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-9">
                            {admin.avatarUrl ? (
                              <AvatarImage
                                src={admin.avatarUrl}
                                alt={admin.name}
                              />
                            ) : null}
                            <AvatarFallback className="text-xs font-semibold">
                              {initials(admin.name, admin.email)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">
                              {admin.name || t('team.unnamed')}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {t('idLabel', { id: admin.userId })}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-sm">
                        {admin.email || '—'}
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline">{admin.role || '—'}</Badge>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={admin.isActive ? 'success' : 'secondary'}
                        >
                          {admin.isActive ? t('active') : t('inactive')}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                        {admin.createdAt
                          ? dateFormat.format(new Date(admin.createdAt))
                          : '—'}
                      </TableCell>

                      {canManage ? (
                        <TableCell className="text-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label={t('team.actionsFor', {
                                  name: admin.name || admin.email,
                                })}
                              >
                                <IconDots />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>
                                {t('team.actions')}
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                disabled={call.isPending}
                                onSelect={() => {
                                  setEditing(admin);
                                  setDialogOpen(true);
                                }}
                              >
                                {t('editAction')}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={call.isPending}
                                onSelect={() =>
                                  call.mutate({
                                    path: `/api/admin/sub-admins/${admin.userId}/status`,
                                    method: 'PATCH',
                                    // The route validates with `toggleFeatureSchema`
                                    // and the controller reads `enabled` — sending
                                    // `isActive` here is a 400.
                                    body: {
                                      key: admin.email || admin.userId,
                                      enabled: !admin.isActive,
                                    },
                                  })
                                }
                              >
                                {admin.isActive
                                  ? t('suspendAction')
                                  : t('activateAction')}
                              </DropdownMenuItem>

                              {canImpersonate ? (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onSelect={() => setImpersonating(admin)}
                                  >
                                    {t('impersonate.action')}
                                  </DropdownMenuItem>
                                </>
                              ) : null}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                disabled={call.isPending}
                                onSelect={() => setPendingDelete(admin)}
                              >
                                {t('deleteAction')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      ) : null}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  {t('team.showing', {
                    from,
                    to,
                    total: pagination.totalRecord,
                  })}
                </p>

                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasPrevious}
                    onClick={() => goToPage(pagination.previousPage || 1)}
                  >
                    {t('team.previous')}
                  </Button>
                  <span className="px-2 text-xs text-muted-foreground tabular-nums">
                    {pagination.currentPage} /{' '}
                    {Math.max(pagination.totalPage, 1)}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasNext}
                    onClick={() => goToPage(pagination.nextPage)}
                  >
                    {t('team.next')}
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <SubAdminDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        admin={editing}
        availablePermissions={availablePermissions}
      />

      <ImpersonateDialog
        open={!!impersonating}
        onOpenChange={(open) => {
          if (!open) setImpersonating(null);
        }}
        target={impersonating}
      />

      <DeleteConfirmDialog
        admin={pendingDelete}
        open={!!pendingDelete}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        onConfirm={() => {
          if (!pendingDelete) return;
          call.mutate(
            {
              path: `/api/admin/sub-admins/${pendingDelete.userId}`,
              method: 'DELETE',
            },
            { onSettled: () => setPendingDelete(null) },
          );
        }}
        pending={call.isPending}
      />
    </>
  );
}

function IconDots() {
  return (
    <span className="flex size-4 items-center justify-center gap-0.5">
      <span className="size-1 rounded-full bg-current" />
      <span className="size-1 rounded-full bg-current" />
      <span className="size-1 rounded-full bg-current" />
    </span>
  );
}

function DeleteConfirmDialog({
  admin,
  open,
  onOpenChange,
  onConfirm,
  pending,
}: {
  admin: SubAdminItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  pending: boolean;
}) {
  const t = useTranslations('admin');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('deleteTitle')}</DialogTitle>
          <DialogDescription>
            {t('deleteDescription', {
              name: admin?.name || admin?.email || '',
            })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {t('cancel')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={pending}
            onClick={onConfirm}
          >
            {t('deleteConfirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
