import { useEffect } from 'react';

interface ShortcutHandler {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  handler: (e: KeyboardEvent) => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: ShortcutHandler[], enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : !e.ctrlKey && !e.metaKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = shortcut.alt ? e.altKey : !e.altKey;
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          e.preventDefault();
          shortcut.handler(e);
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
}

// Common keyboard shortcuts for the app
export const APP_SHORTCUTS: ShortcutHandler[] = [
  {
    key: 'n',
    ctrl: true,
    handler: () => {},
    description: 'New conversation',
  },
  {
    key: 'k',
    ctrl: true,
    handler: () => {},
    description: 'Search conversations',
  },
  {
    key: ',',
    ctrl: true,
    handler: () => {},
    description: 'Open settings',
  },
  {
    key: '/',
    ctrl: true,
    handler: () => {},
    description: 'Focus message input',
  },
  {
    key: 'Escape',
    handler: () => {},
    description: 'Close dialogs',
  },
];
