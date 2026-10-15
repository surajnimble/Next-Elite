/**
 * `feature.reviews` → `Reviews`, `feature.chatSupport` → `Chat support`.
 *
 * Flag names come from the API, never a local list, so a flag added on the
 * backend appears here with a readable name and nothing else to change.
 */
export function humanizeFlag(flag: string): string {
  const last = flag.split('.').pop() ?? flag;

  const words = last
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
    .toLowerCase();

  if (!words) return flag;

  return words.charAt(0).toUpperCase() + words.slice(1);
}

export interface FlagSummary {
  total: number;
  enabled: number;
  disabled: number;
}

export function summarise(flags: Record<string, boolean>): FlagSummary {
  const values = Object.values(flags);
  const enabled = values.filter(Boolean).length;

  return {
    total: values.length,
    enabled,
    disabled: values.length - enabled,
  };
}

export function toFlagList(flags: Record<string, boolean>) {
  return Object.entries(flags)
    .map(([key, enabled]) => ({ key, enabled, name: humanizeFlag(key) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
