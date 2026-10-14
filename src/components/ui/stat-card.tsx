import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/libs/utils';
import { useRipple } from '@/hooks/use-ripple';

type StatCardProps = React.ComponentProps<'div'> & {
  icon?: React.ReactNode;
  title: React.ReactNode;
  value: React.ReactNode;
  growthRate: React.ReactNode;
  isLoading?: boolean;
  ripple?: boolean;
  rippleColor?: string;
  rippleDuration?: number;
};

function StatCard({
  icon,
  title,
  value,
  growthRate,
  isLoading = false,
  className,
  ripple = true,
  rippleColor,
  rippleDuration = 600,
  onClick,
  ...props
}: StatCardProps) {
  const { ripples, addRipple } = useRipple(rippleDuration);

  if (isLoading) {
    return <Skeleton className={cn('h-31.5 w-full rounded-xl', className)} />;
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (ripple) addRipple(e);
    onClick?.(e);
  };

  return (
    <div
      data-slot="stat-card"
      onClick={handleClick}
      style={
        {
          '--ripple-bg':
            rippleColor ?? 'color-mix(in srgb, currentColor 20%, transparent)',
        } as React.CSSProperties
      }
      className={cn(
        'rounded-xl border bg-card p-4 text-card-foreground md:p-6',
        ripple && [
          'relative isolate cursor-pointer overflow-hidden select-none',
          'before:pointer-events-none before:absolute before:inset-0 before:content-[""]',
          'before:bg-foreground/4',
          'before:opacity-0 before:transition-opacity before:duration-200',
          'hover:before:opacity-100',
          'active:before:bg-foreground/8',
        ],
        className,
      )}
      {...props}
    >
      <div className="relative flex items-center gap-3">
        <div className="relative flex items-center gap-3">{icon}</div>
        <div className="relative items-center gap-3">
          <p className="text-2xl font-medium tabular-nums md:text-3xl">
            {value}
          </p>
          <p className="relative text-sm text-muted-foreground">{title}</p>
          <p className="relative text-sm text-muted-foreground">{growthRate}</p>
        </div>
      </div>
      {ripple &&
        ripples.map((r) => (
          <span
            key={r.id}
            className="pointer-events-none absolute top-0 left-0 rounded-full"
            style={
              {
                '--rx': `${r.x}px`,
                '--ry': `${r.y}px`,
                width: r.size,
                height: r.size,
                background: 'var(--ripple-bg)',
                willChange: 'transform, opacity',
                backfaceVisibility: 'hidden',
                animation: `ripple-expand ${rippleDuration}ms ease-out forwards`,
              } as React.CSSProperties
            }
          />
        ))}
    </div>
  );
}

export type { StatCardProps };
export { StatCard };
