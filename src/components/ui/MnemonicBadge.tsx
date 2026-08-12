'use client';

import { useShortcutContext } from '@/src/context/ShortcutContext';

/** Alt-hint badge: only visible while Alt is held. Used internally by Button. */
export function MnemonicBadge({ letter }: { letter: string }) {
  const { altHeld } = useShortcutContext();
  if (!altHeld) return null;
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute -top-1.5 -right-1.5 z-10 flex h-4 min-w-4 items-center justify-center rounded border border-line-strong bg-ink px-1 text-[10px] font-bold leading-none text-surface shadow-sm"
    >
      {letter}
    </span>
  );
}
