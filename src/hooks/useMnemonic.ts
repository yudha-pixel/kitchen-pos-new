import { useEffect, useRef } from 'react';
import { useShortcutContext } from '@/src/context/ShortcutContext';

/**
 * Registers a single-letter Alt-mnemonic for any clickable element — the
 * primitive `Button` uses internally, also usable directly on a raw
 * `<button>`/`<a>` that can't go through the shared component. Pair with
 * `<MnemonicBadge letter={mnemonic} />` (rendered inside a `relative`
 * ancestor) to show the Alt-hint badge.
 */
export function useMnemonic(letter: string | undefined, onTrigger: () => void, disabled = false) {
  const { registerMnemonic } = useShortcutContext();
  const onTriggerRef = useRef(onTrigger);
  onTriggerRef.current = onTrigger;

  useEffect(() => {
    if (!letter || disabled) return;
    return registerMnemonic(letter, () => onTriggerRef.current());
  }, [letter, disabled, registerMnemonic]);
}
