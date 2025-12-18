import { useState, useCallback, useRef, useEffect } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { ChatArea } from './components/chat/ChatArea';
import { KeyboardShortcutsDialog } from './components/settings/KeyboardShortcutsDialog';
import { ToastProvider } from './components/ui/toast';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useChatStore } from './stores/chatStore';
import { useSettingsStore } from './stores/settingsStore';

function App() {
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const messageInputRef = useRef<HTMLTextAreaElement | null>(null);

  const createConversation = useChatStore((state) => state.createConversation);
  const selectedModel = useSettingsStore((state) => state.selectedModel);

  // Expose refs for keyboard shortcuts
  useEffect(() => {
    (window as any).__orionRefs = {
      setShowSettings,
      setShowShortcuts,
      searchInputRef,
      messageInputRef,
    };
  }, []);

  const shortcuts = [
    {
      key: 'n',
      ctrl: true,
      handler: () => {
        createConversation(selectedModel);
      },
      description: 'New conversation',
    },
    {
      key: 'k',
      ctrl: true,
      handler: () => {
        searchInputRef.current?.focus();
      },
      description: 'Search conversations',
    },
    {
      key: ',',
      ctrl: true,
      handler: () => {
        setShowSettings(true);
      },
      description: 'Open settings',
    },
    {
      key: '/',
      ctrl: true,
      handler: () => {
        setShowShortcuts(true);
      },
      description: 'Show keyboard shortcuts',
    },
    {
      key: 'Escape',
      handler: () => {
        setShowSettings(false);
        setShowShortcuts(false);
      },
      description: 'Close dialogs',
    },
  ];

  useKeyboardShortcuts(shortcuts);

  return (
    <ToastProvider>
      <AppLayout>
        <ChatArea />
      </AppLayout>
      <KeyboardShortcutsDialog open={showShortcuts} onOpenChange={setShowShortcuts} />
    </ToastProvider>
  );
}

export default App;
