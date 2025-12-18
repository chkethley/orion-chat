import { User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer';
import { TypingIndicator } from './TypingIndicator';
import type { Message as MessageType } from '@/types/chat';

interface MessageProps {
  message: MessageType;
}

export function Message({ message }: MessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'group relative flex gap-3',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.35)]',
          isUser
            ? 'bg-gradient-to-br from-primary via-primary to-[#f8bf6b] text-primary-foreground'
            : 'bg-white/5 text-foreground'
        )}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>

      {/* Message Bubble */}
      <div
        className={cn(
          'relative max-w-[78%] rounded-2xl border px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl',
          isUser
            ? 'border-primary/30 bg-gradient-to-br from-primary/90 via-primary to-[#f8bf6b]/60 text-[#031915]'
            : 'border-white/10 bg-white/5 text-foreground'
        )}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground/80">
          <span>{isUser ? 'You' : 'Orion'}</span>
          <span className="h-px flex-1 bg-white/10" />
        </div>

        {isUser ? (
          // User messages: plain text
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>
        ) : (
          // Assistant messages: markdown rendering
          <div>
            {message.content ? (
              <>
                <MarkdownRenderer content={message.content} />
                {message.isStreaming && (
                  <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-current" />
                )}
              </>
            ) : message.isStreaming ? (
              <TypingIndicator />
            ) : null}
          </div>
        )}

        {/* Tool calls will be rendered here in Phase 7 */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mt-2 text-xs opacity-70">
            Using tools: {message.toolCalls.map((tc) => tc.function.name).join(', ')}
          </div>
        )}
      </div>
    </div>
  );
}
