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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMutation } from '@tanstack/react-query';
import type { SubAdminItem } from '@/libs/models';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

export interface SubAdminForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  permissions: string[];
}

const EMPTY_FORM: SubAdminForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
  permissions: [],
};

interface SubAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present when editing; omitted when creating. */
  admin?: SubAdminItem | null;
  /** Every permission any role currently has, straight from the API. */
  availablePermissions: string[];
}

export function SubAdminDialog({
  open,
  onOpenChange,
  admin,
  availablePermissions,
}: SubAdminDialogProps) {
  const t = useTranslations('admin');
  const router = useRouter();
  const isEdit = !!admin;

  const [form, setForm] = useState<SubAdminForm>(EMPTY_FORM);

  // Re-seed the form whenever the dialog opens for a different admin.
  const [seededFor, setSeededFor] = useState<string | null>(null);
  if (open && seededFor !== (admin?.userId ?? 'new')) {
    setSeededFor(admin?.userId ?? 'new');
    setForm(
      admin
        ? {
            name: admin.name,
            email: admin.email,
            phone: admin.phone,
            // Password is never returned by the API, and is never edited here —
            // the backend's update schema has no password field.
            password: '',
            permissions: [],
          }
        : EMPTY_FORM,
    );
  }
  if (!open && seededFor !== null) setSeededFor(null);

  const save = useMutation({
    mutationFn: async () => {
      const url = admin
        ? `/api/admin/sub-admins/${admin.userId}`
        : '/api/admin/sub-admins';

      const body = admin
        ? {
            name: form.name,
            phone: form.phone || undefined,
            ...(form.permissions.length
              ? { permissions: form.permissions }
              : {}),
          }
        : {
            name: form.name,
            email: form.email,
            phone: form.phone || undefined,
            password: form.password,
            permissions: form.permissions,
          };

      const response = await fetch(url, {
        method: admin ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(payload.message || t('actionFailed'));
      }
      return payload;
    },
    onSuccess: () => {
      toast.success(isEdit ? t('updated') : t('created'));
      onOpenChange(false);
      router.refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    save.mutate();
  }

  const valid = isEdit
    ? form.name.trim().length >= 2
    : form.name.trim().length >= 2 &&
      /\S+@\S+\.\S+/.test(form.email) &&
      form.password.length >= 8;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t('editTitle') : t('createTitle')}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? t('editDescription') : t('createDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="subadmin-name">{t('fields.name')}</Label>
            <Input
              id="subadmin-name"
              value={form.name}
              onChange={(event) =>
                setForm((f) => ({ ...f, name: event.target.value }))
              }
              placeholder={t('fields.namePlaceholder')}
              required
            />
          </div>

          {!isEdit ? (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="subadmin-email">{t('fields.email')}</Label>
                <Input
                  id="subadmin-email"
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((f) => ({ ...f, email: event.target.value }))
                  }
                  placeholder={t('fields.emailPlaceholder')}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="subadmin-password">
                  {t('fields.password')}
                </Label>
                <Input
                  id="subadmin-password"
                  type="password"
                  value={form.password}
                  onChange={(event) =>
                    setForm((f) => ({ ...f, password: event.target.value }))
                  }
                  placeholder={t('fields.passwordPlaceholder')}
                  minLength={8}
                  required
                />
              </div>
            </>
          ) : null}

          <div className="flex flex-col gap-2">
            <Label htmlFor="subadmin-phone">{t('fields.phone')}</Label>
            <Input
              id="subadmin-phone"
              value={form.phone}
              onChange={(event) =>
                setForm((f) => ({ ...f, phone: event.target.value }))
              }
              placeholder={t('fields.phonePlaceholder')}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="subadmin-permissions">
              {t('fields.permissions')}
            </Label>
            <Select
              value={form.permissions[0] ?? 'none'}
              onValueChange={(value) =>
                setForm((f) => ({
                  ...f,
                  permissions: value === 'none' ? [] : [value],
                }))
              }
            >
              <SelectTrigger id="subadmin-permissions">
                <SelectValue placeholder={t('fields.permissionsPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  {t('fields.permissionsNone')}
                </SelectItem>
                {availablePermissions.map((permission) => (
                  <SelectItem key={permission} value={permission}>
                    {permission}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {form.permissions.length
                ? t('fields.permissionsHint', {
                    count: form.permissions.length,
                  })
                : t('fields.permissionsDefault')}
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={!valid || save.isPending}>
              {save.isPending ? t('saving') : t('save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
