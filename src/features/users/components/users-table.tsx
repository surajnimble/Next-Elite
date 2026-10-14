'use client';

import { Icon } from '@/components/icons/app-icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useMutation } from '@tanstack/react-query';
import type { PaginatedResult, UserItem, UserStatus } from '@/libs/models';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

const ALL = 'all';

const STATUS_FILTERS: UserStatus[] = ['active', 'inactive', 'suspended'];

interface UsersTableProps {
  users: UserItem[];
  pagination: PaginatedResult;
  roles: string[];
  search: string;
  role: string;
  status: string;
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
  return (parts[0]?.slice(0, 2) ?? 'U').toUpperCase();
}

export function UsersTable({
  users,
  pagination,
  roles,
  search,
  role,
  status,
}: UsersTableProps) {
  const t = useTranslations('users');
  const locale = useLocale();
  const router = useRouter();

  const [searchInput, setSearchInput] = useState(search);
  const [statusInput, setStatusInput] = useState(status);
  const [roleInput, setRoleInput] = useState(role);

  const toggle = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await fetch(`/api/admin/users/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });
      const payload = (await response.json()) as {
        message?: string;
      };
      if (!response.ok) throw new Error(payload.message || t('actionFailed'));
      return payload;
    },
    onSuccess: () => {
      toast.success(t('statusUpdated'));
      router.refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  /** Filters live in the URL so refresh and paging keep them. */
  function applyFilters(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    const term = searchInput.trim();
    if (term) params.set('search', term);
    if (roleInput !== ALL && roleInput) params.set('role', roleInput);
    if (statusInput !== ALL && statusInput) params.set('status', statusInput);
    const query = params.toString();
    router.push(query ? `/users?${query}` : '/users');
  }

  function goToPage(page: number) {
    const params = new URLSearchParams();
    const term = search.trim();
    if (term) params.set('search', term);
    if (role) params.set('role', role);
    if (status) params.set('status', status);
    if (page > 1) params.set('page', String(page));
    const query = params.toString();
    router.push(query ? `/users?${query}` : '/users');
  }

  function relativeTime(value: string): string {
    if (!value) return '—';
    const then = new Date(value).getTime();
    if (Number.isNaN(then)) return '—';

    const seconds = Math.round((Date.now() - then) / 1000);
    const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    const units: [Intl.RelativeTimeFormatUnit, number][] = [
      ['year', 31_536_000],
      ['month', 2_592_000],
      ['day', 86_400],
      ['hour', 3_600],
      ['minute', 60],
    ];

    for (const [unit, size] of units) {
      if (Math.abs(seconds) >= size) {
        return formatter.format(-Math.round(seconds / size), unit);
      }
    }
    return formatter.format(-seconds, 'second');
  }

  const from = users.length
    ? (pagination.currentPage - 1) * pagination.limit + 1
    : 0;
  const to = from + users.length - 1;

  return (
    <Card variant="glow">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1.5">
            <CardTitle>{t('directory.title')}</CardTitle>
            <CardDescription>
              {t('directory.description', { total: pagination.totalRecord })}
            </CardDescription>
          </div>
        </div>

        <form
          onSubmit={applyFilters}
          className="mt-4 flex flex-wrap items-center gap-2"
        >
          <div className="relative min-w-48 flex-1">
            <Icon
              name="search"
              className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder={t('directory.searchPlaceholder')}
              aria-label={t('directory.searchPlaceholder')}
              className="ps-9"
            />
          </div>

          <Select value={statusInput || ALL} onValueChange={setStatusInput}>
            <SelectTrigger className="w-40" aria-label={t('directory.status')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t('directory.statusAll')}</SelectItem>
              {STATUS_FILTERS.map((value) => (
                <SelectItem key={value} value={value}>
                  {t(
                    value === 'active'
                      ? 'statusActive'
                      : value === 'inactive'
                        ? 'statusInactive'
                        : 'statusSuspended',
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={roleInput || ALL} onValueChange={setRoleInput}>
            <SelectTrigger className="w-40" aria-label={t('directory.role')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t('directory.roleAll')}</SelectItem>
              {roles.map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button type="submit" variant="outline">
            {t('directory.apply')}
          </Button>
        </form>
      </CardHeader>

      <CardContent>
        {users.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            {t('directory.empty')}
          </p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('directory.user')}</TableHead>
                  <TableHead>{t('directory.role')}</TableHead>
                  <TableHead>{t('directory.status')}</TableHead>
                  <TableHead>{t('directory.lastActive')}</TableHead>
                  <TableHead className="text-end">
                    {t('directory.actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.userId}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9">
                          {user.avatarUrl ? (
                            <AvatarImage src={user.avatarUrl} alt={user.name} />
                          ) : null}
                          <AvatarFallback className="text-xs font-semibold">
                            {initials(user.name, user.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {user.name || t('noName')}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {t('idLabel', { id: user.userId })} · {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline">{user.role || '—'}</Badge>
                    </TableCell>

                    <TableCell>
                      <Badge variant={user.isActive ? 'default' : 'secondary'}>
                        {user.isActive
                          ? t('statusActive')
                          : t('statusInactive')}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                      {relativeTime(user.lastLoginAt)}
                    </TableCell>

                    <TableCell className="text-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={t('directory.actionsFor', {
                              name: user.name || user.email,
                            })}
                          >
                            <Icon name="settings" className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            disabled={toggle.isPending}
                            onSelect={() =>
                              toggle.mutate({
                                id: user.userId,
                                isActive: !user.isActive,
                              })
                            }
                          >
                            {user.isActive
                              ? t('directory.suspend')
                              : t('directory.activate')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                {t('directory.showing', {
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
                  <Icon name="left" className="size-3.5" />
                  {t('directory.previous')}
                </Button>

                <span className="px-2 text-xs text-muted-foreground tabular-nums">
                  {pagination.currentPage} / {Math.max(pagination.totalPage, 1)}
                </span>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasNext}
                  onClick={() => goToPage(pagination.nextPage)}
                >
                  {t('directory.next')}
                  <Icon name="right" className="size-3.5" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
