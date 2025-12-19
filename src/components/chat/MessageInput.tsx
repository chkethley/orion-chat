import { useState, KeyboardEvent } from 'react';
import { Send, Square } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useChatStore } from '@/stores/chatStore';
import { useStreaming } from '@/hooks/useStreaming';

interface MessageInputProps {
  conversationId: string;
}

export function MessageInput({ conversationId }: MessageInputProps) {
  const [input, setInput] = useState('');
  const addMessage = useChatStore((state) => state.addMessage);
  const isStreaming = useChatStore((state) => state.isStreaming);
  const { sendMessage, cancelStreaming } = useStreaming();

  const handleSubmit = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage = input.trim();

    // Add user message
    addMessage(conversationId, {
      role: 'user',
      content: userMessage,
    });

    // Clear input immediately
    setInput('');

    // Send message and stream response
    await sendMessage(conversationId, userMessage);
  };

  const handleCancel = () => {
    cancelStreaming();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-white/5 bg-gradient-to-r from-white/5 via-transparent to-transparent p-4">
      <div className="rounded-2xl border border-white/8 bg-[#0c1323]/80 px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="flex gap-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Shift+Enter for new line)"
            className="min-h-[64px] max-h-32 resize-none rounded-xl border-white/10 bg-white/5 text-sm"
            disabled={isStreaming}
          />
          {isStreaming ? (
            <Button
              onClick={handleCancel}
              variant="destructive"
              size="icon"
              className="h-[64px] w-14 rounded-xl"
            >
              <Square className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!input.trim()}
              size="icon"
              className="h-[64px] w-14 rounded-xl bg-gradient-to-br from-primary via-primary to-[#2de2a6] text-[#061a2c] shadow-[0_15px_40px_rgba(74,163,255,0.35)] hover:brightness-110"
            >
              <Send className="h-5 w-5" />
            </Button>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>Enter to send • Shift+Enter for a new line</span>
          {isStreaming && <span className="flex items-center gap-2 text-primary">Streaming...</span>}
        </div>
      </div>
    </div>
  );
}
