import * as React from 'react';

type Ripple = {
  id: number;
  x: number;
  y: number;
  size: number;
};

export function useRipple(duration = 600) {
  const [ripples, setRipples] = React.useState<Ripple[]>([]);
  const addRipple = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const id = Date.now() + Math.random();

    setRipples((prev) => [...prev, { id, x, y, size }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, duration);
  };

  return { ripples, addRipple };
}
