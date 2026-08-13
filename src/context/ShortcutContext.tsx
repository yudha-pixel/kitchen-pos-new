'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

interface ShortcutContextValue {
  /** True while Alt is held down — drives mnemonic hint badges on Button. */
  altHeld: boolean;
  /**
   * Registers a single-letter mnemonic (Windows-style: hold Alt, press the
   * letter). Returns an unregister function for cleanup on unmount.
   * If the letter is already registered by another mounted button, the
   * earliest-registered one wins and a dev warning is logged — mnemonics are
   * assigned explicitly per button, not auto-derived, so a collision means
   * two buttons on the same screen were given the same letter by mistake.
   */
  registerMnemonic: (letter: string, onTrigger: () => void) => () => void;
}

const ShortcutContext = createContext<ShortcutContextValue | undefined>(undefined);

export function ShortcutProvider({ children }: { children: ReactNode }) {
  const [altHeld, setAltHeld] = useState(false);
  const registryRef = useRef(new Map<string, Set<() => void>>());

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Alt') {
        setAltHeld(true);
        return;
      }
      if (!event.altKey || event.ctrlKey || event.metaKey) return;
      if (!/^[a-zA-Z0-9]$/.test(event.key)) return;

      const triggers = registryRef.current.get(event.key.toUpperCase());
      if (!triggers || triggers.size === 0) return;
      event.preventDefault();
      const [first] = triggers;
      first();
    }

    function handleKeyUp(event: KeyboardEvent) {
      if (event.key === 'Alt') setAltHeld(false);
    }

    // Alt-Tabbing away never fires a keyup for Alt on this page — without this,
    // hint badges could get stuck visible after the window loses focus.
    function handleBlur() {
      setAltHeld(false);
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  const registerMnemonic = useCallback((letter: string, onTrigger: () => void) => {
    const key = letter.toUpperCase();
    const registry = registryRef.current;
    if (!registry.has(key)) registry.set(key, new Set());
    const triggers = registry.get(key)!;
    if (triggers.size > 0 && process.env.NODE_ENV !== 'production') {
      console.warn(`[ShortcutContext] Mnemonic "${key}" is already registered by another visible button — only the first one will respond.`);
    }
    triggers.add(onTrigger);
    return () => {
      triggers.delete(onTrigger);
      if (triggers.size === 0) registry.delete(key);
    };
  }, []);

  return (
    <ShortcutContext.Provider value={{ altHeld, registerMnemonic }}>
      {children}
    </ShortcutContext.Provider>
  );
}

export function useShortcutContext() {
  const context = useContext(ShortcutContext);
  if (context === undefined) {
    throw new Error('useShortcutContext must be used within a ShortcutProvider');
  }
  return context;
}
