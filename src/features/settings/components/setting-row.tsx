'use client';

import { cn } from '@/libs/utils';
import type { ReactNode } from 'react';

interface SettingRowProps {
  label: string;
  description?: string;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}

/** Title and explanation on the start side, the control on the end side. */
export function SettingRow({
  label,
  description,
  children,
  disabled = false,
  className,
}: SettingRowProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6',
        className,
      )}
    >
      <div className="min-w-0 space-y-1">
        <p
          className={cn(
            'text-sm font-medium text-foreground',
            disabled && 'opacity-60',
          )}
        >
          {label}
        </p>
        {description ? (
          <p className="text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-2">{children}</div>
    </div>
  );
}

export function SettingRowGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('divide-y divide-border/40', className)}>{children}</div>
  );
}
