import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Message as MessageComponent } from './Message';
import type { Message } from '@/types/chat';

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <ScrollArea className="flex-1">
      <div
        ref={scrollRef}
        className="mx-auto flex max-w-4xl flex-col gap-4 px-6 py-8"
      >
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 py-12 text-muted-foreground">
            <p className="text-sm">Start a conversation...</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageComponent key={message.id} message={message} />
          ))
        )}
      </div>
    </ScrollArea>
  );
}
