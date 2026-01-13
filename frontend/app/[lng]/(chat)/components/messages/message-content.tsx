"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

type CodeProps = {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
};

type LinkProps = {
  children?: React.ReactNode;
  href?: string;
};

export function MessageContent({ content }: { content: string }) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Code block
          code: ({ inline, className, children }: CodeProps) => {
            return !inline ? (
              <code className={className}>{children}</code>
            ) : (
              <code className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-sm">
                {children}
              </code>
            );
          },
          // Links
          a: ({ children, href }: LinkProps) => (
            <a
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
              href={href}
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
