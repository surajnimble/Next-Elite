'use client';

import { Button } from '@/components/ui/button';
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
import { useMutation } from '@tanstack/react-query';
import type { ImpersonationResult } from '@/libs/models';
import { useTranslations } from 'next-intl';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

interface ImpersonateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: { userId: string; name: string; email: string } | null;
}

export function ImpersonateDialog({
  open,
  onOpenChange,
  target,
}: ImpersonateDialogProps) {
  const t = useTranslations('admin');
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState('30');
  const [result, setResult] = useState<ImpersonationResult | null>(null);

  const run = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/admin/users/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: target?.userId,
          reason,
          durationMin: Number(duration) || 30,
        }),
      });
      const payload = (await response.json()) as {
        message?: string;
        data?: ImpersonationResult;
      };
      if (!response.ok) {
        throw new Error(payload.message || t('actionFailed'));
      }
      return payload;
    },
    onSuccess: (payload) => {
      if (payload.data) setResult(payload.data);
      toast.success(t('impersonate.done'));
    },
    onError: (err: Error) => toast.error(err.message),
  });

  function close(next: boolean) {
    onOpenChange(next);
    if (!next) {
      setReason('');
      setDuration('30');
      setResult(null);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    run.mutate();
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('impersonate.title')}</DialogTitle>
          <DialogDescription>
            {t('impersonate.description', {
              name: target?.name || target?.email || '',
            })}
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <>
            <div className="rounded-md border border-warning/40 bg-warning/5 p-3">
              <p className="text-xs font-medium text-warning-foreground">
                {t('impersonate.tokenWarning')}
              </p>
              <code className="mt-2 block w-full overflow-x-auto font-mono text-[0.65rem]">
                {result.accessToken}
              </code>
            </div>

            <p className="text-xs text-muted-foreground">
              {t('impersonate.audited')}
            </p>

            <DialogFooter>
              <Button type="button" onClick={() => close(false)}>
                {t('impersonate.done')}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="impersonate-reason">
                {t('impersonate.reason')}
              </Label>
              <Input
                id="impersonate-reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder={t('impersonate.reasonPlaceholder')}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="impersonate-duration">
                {t('impersonate.duration')}
              </Label>
              <Input
                id="impersonate-duration"
                type="number"
                min={1}
                max={480}
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
              />
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => close(false)}
              >
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={reason.trim().length === 0 || run.isPending}
              >
                {run.isPending ? t('saving') : t('impersonate.submit')}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
