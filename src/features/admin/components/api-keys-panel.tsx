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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useMutation } from '@tanstack/react-query';
import type { ApiKeyListResult, CreatedApiKey } from '@/libs/models';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

interface ApiKeysPanelProps {
  data: ApiKeyListResult | null;
  error?: string;
  /** Creating and deleting are super-admin-only; listing and revoking are not. */
  canManage: boolean;
}

export function ApiKeysPanel({ data, error, canManage }: ApiKeysPanelProps) {
  const t = useTranslations('admin');
  const locale = useLocale();
  const router = useRouter();

  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [scopes, setScopes] = useState('');
  const [expiresInDays, setExpiresInDays] = useState('');
  /** The plaintext key is shown once, then discarded. */
  const [revealed, setRevealed] = useState<CreatedApiKey | null>(null);

  const dateFormat = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' });

  const act = useMutation({
    mutationFn: async ({
      method,
      body,
    }: {
      method: 'POST' | 'PATCH';
      body: Record<string, unknown>;
    }) => {
      const response = await fetch('/api/admin/api-keys', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const payload = (await response.json()) as {
        message?: string;
        data?: CreatedApiKey;
      };
      if (!response.ok) {
        throw new Error(payload.message || t('actionFailed'));
      }
      return payload;
    },
    onSuccess: (payload, variables) => {
      if (variables.method === 'POST' && payload.data) {
        setRevealed(payload.data);
      } else {
        toast.success(t('apiKeys.updated'));
      }
      setCreateOpen(false);
      setName('');
      setScopes('');
      setExpiresInDays('');
      router.refresh();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    act.mutate({
      method: 'POST',
      body: {
        name,
        scopes: scopes
          .split(/[\n,]/)
          .map((entry) => entry.trim())
          .filter(Boolean),
        ...(expiresInDays ? { expiresInDays: Number(expiresInDays) } : {}),
      },
    });
  }

  return (
    <>
      <Card variant="glow">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1.5">
              <CardTitle>{t('apiKeys.title')}</CardTitle>
              <CardDescription>
                {data
                  ? t('apiKeys.description', { count: data.itemCount })
                  : t('apiKeys.descriptionFallback')}
              </CardDescription>
            </div>

            {canManage ? (
              <Button
                type="button"
                size="sm"
                onClick={() => setCreateOpen(true)}
              >
                {t('apiKeys.createAction')}
              </Button>
            ) : null}
          </div>
        </CardHeader>

        <CardContent>
          {error ? (
            <p className="py-6 text-sm text-muted-foreground">{error}</p>
          ) : !data ? (
            <p className="py-6 text-sm text-muted-foreground">
              {t('apiKeys.unavailable')}
            </p>
          ) : data.itemList.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">
              {t('apiKeys.empty')}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('apiKeys.name')}</TableHead>
                  <TableHead>{t('apiKeys.prefix')}</TableHead>
                  <TableHead>{t('apiKeys.scopes')}</TableHead>
                  <TableHead>{t('apiKeys.status')}</TableHead>
                  <TableHead>{t('apiKeys.usage')}</TableHead>
                  <TableHead className="text-end">
                    {t('apiKeys.actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.itemList.map((key) => {
                  const expired =
                    !!key.expiresAt && new Date(key.expiresAt) < new Date();

                  return (
                    <TableRow key={key.id}>
                      <TableCell>
                        <p className="text-sm font-medium text-foreground">
                          {key.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {key.createdAt
                            ? dateFormat.format(new Date(key.createdAt))
                            : '—'}
                        </p>
                      </TableCell>

                      <TableCell>
                        <code className="rounded bg-muted px-2 py-1 font-mono text-xs">
                          {key.prefix || '—'}
                        </code>
                      </TableCell>

                      <TableCell className="max-w-48">
                        <div className="flex flex-wrap gap-1">
                          {key.scopes.length === 0 ? (
                            <span className="text-xs text-muted-foreground">
                              {t('apiKeys.noScopes')}
                            </span>
                          ) : (
                            key.scopes.map((scope) => (
                              <Badge key={scope} variant="outline">
                                {scope}
                              </Badge>
                            ))
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            !key.isActive
                              ? 'secondary'
                              : expired
                                ? 'warning'
                                : 'success'
                          }
                        >
                          {!key.isActive
                            ? t('apiKeys.revoked')
                            : expired
                              ? t('apiKeys.expired')
                              : t('apiKeys.active')}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-sm tabular-nums">
                        {key.usageCount}
                        <span className="ms-1 text-xs text-muted-foreground">
                          {t('apiKeys.calls')}
                        </span>
                      </TableCell>

                      <TableCell className="text-end">
                        <div className="flex items-center justify-end gap-2">
                          {key.isActive ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={act.isPending}
                              onClick={() =>
                                act.mutate({
                                  method: 'PATCH',
                                  body: { id: key.id, action: 'revoke' },
                                })
                              }
                            >
                              {t('apiKeys.revokeAction')}
                            </Button>
                          ) : null}

                          {canManage ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={act.isPending}
                              onClick={() =>
                                act.mutate({
                                  method: 'PATCH',
                                  body: { id: key.id, action: 'delete' },
                                })
                              }
                            >
                              {t('apiKeys.deleteAction')}
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('apiKeys.createTitle')}</DialogTitle>
            <DialogDescription>
              {t('apiKeys.createDescription')}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="apikey-name">{t('apiKeys.name')}</Label>
              <Input
                id="apikey-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={t('apiKeys.namePlaceholder')}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="apikey-scopes">{t('apiKeys.scopes')}</Label>
              <Input
                id="apikey-scopes"
                value={scopes}
                onChange={(event) => setScopes(event.target.value)}
                placeholder={t('apiKeys.scopesPlaceholder')}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="apikey-expiry">
                {t('apiKeys.expiresInDays')}
              </Label>
              <Input
                id="apikey-expiry"
                type="number"
                min={1}
                max={3650}
                value={expiresInDays}
                onChange={(event) => setExpiresInDays(event.target.value)}
                placeholder={t('apiKeys.expiresPlaceholder')}
              />
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
              >
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                disabled={name.trim().length < 2 || act.isPending}
              >
                {act.isPending ? t('saving') : t('apiKeys.createAction')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!revealed}
        onOpenChange={(open) => {
          if (!open) setRevealed(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('apiKeys.revealedTitle')}</DialogTitle>
            <DialogDescription>
              {t('apiKeys.revealedDescription')}
            </DialogDescription>
          </DialogHeader>

          <code className="block w-full overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs">
            {revealed?.key}
          </code>

          <DialogFooter>
            <Button type="button" onClick={() => setRevealed(null)}>
              {t('apiKeys.done')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
