import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Kbd } from '@/components/ui/kbd';

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const SHORTCUTS: Shortcut[] = [
  // Navigation
  { keys: ['Ctrl', 'N'], description: 'New conversation', category: 'Navigation' },
  { keys: ['Ctrl', 'K'], description: 'Search conversations', category: 'Navigation' },
  { keys: ['Ctrl', ','], description: 'Open settings', category: 'Navigation' },
  { keys: ['Ctrl', '/'], description: 'Show keyboard shortcuts', category: 'Navigation' },
  { keys: ['Esc'], description: 'Close dialogs', category: 'Navigation' },

  // Messaging
  { keys: ['Enter'], description: 'Send message', category: 'Messaging' },
  { keys: ['Shift', 'Enter'], description: 'New line in message', category: 'Messaging' },
  { keys: ['Ctrl', 'Enter'], description: 'Send message (alternative)', category: 'Messaging' },

  // Editing
  { keys: ['Ctrl', 'A'], description: 'Select all text', category: 'Editing' },
  { keys: ['Ctrl', 'Z'], description: 'Undo', category: 'Editing' },
  { keys: ['Ctrl', 'Y'], description: 'Redo', category: 'Editing' },
];

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  const categories = Array.from(new Set(SHORTCUTS.map((s) => s.category)));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Speed up your workflow with these keyboard shortcuts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {categories.map((category) => (
            <div key={category}>
              <h3 className="text-sm font-semibold mb-3 text-foreground">{category}</h3>
              <div className="space-y-2">
                {SHORTCUTS.filter((s) => s.category === category).map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <span key={keyIndex} className="flex items-center gap-1">
                          <Kbd>{key}</Kbd>
                          {keyIndex < shortcut.keys.length - 1 && (
                            <span className="text-xs text-muted-foreground">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
