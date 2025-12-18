import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './CodeBlock';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="markdown prose prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Code blocks
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const codeContent = String(children).replace(/\n$/, '');

            if (!inline && match) {
              return <CodeBlock language={match[1]} value={codeContent} />;
            }

            // Inline code
            return (
              <code
                className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono"
                {...props}
              >
                {children}
              </code>
            );
          },

          // Links
          a({ node, children, href, ...props }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
                {...props}
              >
                {children}
              </a>
            );
          },

          // Headings
          h1({ node, children, ...props }) {
            return (
              <h1 className="text-2xl font-bold mt-6 mb-4" {...props}>
                {children}
              </h1>
            );
          },
          h2({ node, children, ...props }) {
            return (
              <h2 className="text-xl font-bold mt-5 mb-3" {...props}>
                {children}
              </h2>
            );
          },
          h3({ node, children, ...props }) {
            return (
              <h3 className="text-lg font-bold mt-4 mb-2" {...props}>
                {children}
              </h3>
            );
          },

          // Lists
          ul({ node, children, ...props }) {
            return (
              <ul className="list-disc list-inside my-4 space-y-2" {...props}>
                {children}
              </ul>
            );
          },
          ol({ node, children, ...props }) {
            return (
              <ol className="list-decimal list-inside my-4 space-y-2" {...props}>
                {children}
              </ol>
            );
          },

          // Paragraphs
          p({ node, children, ...props }) {
            return (
              <p className="my-3 leading-relaxed" {...props}>
                {children}
              </p>
            );
          },

          // Blockquotes
          blockquote({ node, children, ...props }) {
            return (
              <blockquote
                className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground"
                {...props}
              >
                {children}
              </blockquote>
            );
          },

          // Tables
          table({ node, children, ...props }) {
            return (
              <div className="my-4 overflow-x-auto">
                <table className="min-w-full border-collapse" {...props}>
                  {children}
                </table>
              </div>
            );
          },
          th({ node, children, ...props }) {
            return (
              <th className="border border-border bg-muted px-4 py-2 text-left font-semibold" {...props}>
                {children}
              </th>
            );
          },
          td({ node, children, ...props }) {
            return (
              <td className="border border-border px-4 py-2" {...props}>
                {children}
              </td>
            );
          },

          // Horizontal rule
          hr({ node, ...props }) {
            return <hr className="my-6 border-border" {...props} />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
