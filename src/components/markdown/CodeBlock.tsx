import { useState } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CodeBlockProps {
  language?: string;
  value: string;
}

export function CodeBlock({ language, value }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const safeLanguage =
    language && hljs.getLanguage(language) ? language : undefined;

  // Highlight the code with a safe fallback for unknown languages.
  let highlightedCode = '';
  try {
    highlightedCode = safeLanguage
      ? hljs.highlight(value, { language: safeLanguage, ignoreIllegals: true }).value
      : hljs.highlightAuto(value).value;
  } catch (error) {
    highlightedCode = hljs.highlightAuto(value).value;
  }

  return (
    <div className="group relative my-4">
      {/* Language label and copy button */}
      <div className="flex items-center justify-between rounded-t-md bg-[#1a1a1a] px-4 py-2 text-xs">
        <span className="text-muted-foreground">
          {language || 'plaintext'}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="mr-1 h-3 w-3" />
              Copied
            </>
          ) : (
            <>
              <Copy className="mr-1 h-3 w-3" />
              Copy
            </>
          )}
        </Button>
      </div>

      {/* Code content */}
      <pre className="!mt-0 overflow-x-auto rounded-b-md bg-[#1a1a1a] p-4">
        <code
          className={`language-${safeLanguage || 'plaintext'}`}
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </pre>
    </div>
  );
}
