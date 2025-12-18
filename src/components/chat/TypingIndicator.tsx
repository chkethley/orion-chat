import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  className?: string;
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex gap-1">
        <span className="animate-bounce [animation-delay:-0.3s]">
          <span className="inline-block w-2 h-2 rounded-full bg-muted-foreground/60" />
        </span>
        <span className="animate-bounce [animation-delay:-0.15s]">
          <span className="inline-block w-2 h-2 rounded-full bg-muted-foreground/60" />
        </span>
        <span className="animate-bounce">
          <span className="inline-block w-2 h-2 rounded-full bg-muted-foreground/60" />
        </span>
      </div>
    </div>
  );
}
