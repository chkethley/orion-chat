import { useEffect } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useToast } from '@/components/ui/toast';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

export function ChatArea() {
  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const conversations = useChatStore((state) => state.conversations);
  const error = useChatStore((state) => state.error);
  const setError = useChatStore((state) => state.setError);
  const { addToast } = useToast();

  const activeConversation = conversations.find(
    (conv) => conv.id === activeConversationId
  );

  // Show toast notification for errors
  useEffect(() => {
    if (error) {
      addToast('error', error);
      // Clear the error after showing toast
      setTimeout(() => setError(null), 100);
    }
  }, [error, addToast, setError]);

  if (!activeConversationId || !activeConversation) {
    return (
      <div className="relative flex h-full flex-col items-center justify-center overflow-hidden text-muted-foreground">
        <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_25%_20%,rgba(74,163,255,0.14),transparent_30%),radial-gradient(circle_at_80%_15%,rgba(45,226,166,0.12),transparent_28%),radial-gradient(circle_at_50%_70%,rgba(90,170,255,0.1),transparent_26%)]" />
        <div className="relative z-10 flex flex-col items-center gap-3 rounded-3xl border border-white/5 bg-white/5 px-8 py-10 text-center shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/70 via-primary to-[#2de2a6]/80 shadow-[0_10px_30px_rgba(74,163,255,0.45)]" />
          <p className="text-lg font-semibold text-foreground">Start a new conversation</p>
          <p className="max-w-md text-sm text-muted-foreground">
            Spin up a fresh thread or pick one from the sidebar. Orion keeps your history organized
            and ready to pick up where you left off.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_18%_10%,rgba(74,163,255,0.16),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(45,226,166,0.14),transparent_32%),radial-gradient(circle_at_40%_70%,rgba(90,170,255,0.12),transparent_25%)]" />
      <div className="relative z-10 flex h-full flex-col">
        {/* Message List */}
        <MessageList messages={activeConversation.messages} />

        {/* Message Input */}
        <MessageInput conversationId={activeConversationId} />
      </div>
    </div>
  );
}
