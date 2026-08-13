import { useEffect, useRef } from 'react';

interface UseGlobalHotkeyOptions {
  enabled?: boolean;
  /** Fire even while a text input/textarea/contentEditable is focused. Default false. */
  allowInInputs?: boolean;
}

const TYPING_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

/**
 * Binds a standalone global keyboard shortcut, independent of the Alt-mnemonic
 * system in ShortcutContext — for always-on shortcuts like "F2" or "Ctrl+P"
 * that don't require holding Alt.
 *
 * combo: e.g. "F2", "Escape", "Ctrl+P", "Alt+N". Case-insensitive, "+"-separated,
 * modifiers (ctrl/alt/shift) in any order with the key last.
 */
export function useGlobalHotkey(combo: string, handler: (event: KeyboardEvent) => void, options?: UseGlobalHotkeyOptions) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (options?.enabled === false) return;

    const parts = combo.split('+').map((part) => part.trim().toLowerCase());
    const needCtrl = parts.includes('ctrl');
    const needAlt = parts.includes('alt');
    const needShift = parts.includes('shift');
    const key = parts[parts.length - 1];

    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping = Boolean(target && (TYPING_TAGS.has(target.tagName) || target.isContentEditable));
      if (isTyping && !options?.allowInInputs) return;

      if (event.ctrlKey !== needCtrl) return;
      if (event.altKey !== needAlt) return;
      if (event.shiftKey !== needShift) return;
      if (event.key.toLowerCase() !== key) return;

      event.preventDefault();
      handlerRef.current(event);
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [combo, options?.enabled, options?.allowInInputs]);
}
