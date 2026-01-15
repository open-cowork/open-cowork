"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import type { MessageBlock } from "@/lib/api-types";

type CodeProps = {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
};

type LinkProps = {
  children?: React.ReactNode;
  href?: string;
};

const PreBlock = ({
  children,
  ...props
}: React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLPreElement>,
  HTMLPreElement
> & { node?: unknown }) => {
  const preRef = React.useRef<HTMLPreElement>(null);
  const [isCopied, setIsCopied] = React.useState(false);

  const onCopy = async () => {
    if (!preRef.current) return;
    const text = preRef.current.textContent || "";
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code", err);
    }
  };

  return (
    <div className="relative group my-4">
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-background/80 bg-background/50 backdrop-blur-sm"
          onClick={onCopy}
        >
          {isCopied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      <pre ref={preRef} className="rounded-lg overflow-x-auto" {...props}>
        {children}
      </pre>
    </div>
  );
};

export function MessageContent({
  content,
}: {
  content: string | MessageBlock[];
}) {
  // Helper function to extract text content from message
  const getTextContent = (content: string | MessageBlock[]): string => {
    if (typeof content === "string") {
      return content;
    }

    // If it's an array of blocks, extract text from TextBlock
    if (Array.isArray(content)) {
      const textBlocks = content.filter(
        (block: MessageBlock) => block._type === "TextBlock",
      );
      return textBlocks
        .map((block: MessageBlock) =>
          block._type === "TextBlock" ? block.text : "",
        )
        .join("\n\n");
    }

    return String(content);
  };

  const textContent = getTextContent(content);

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none break-words w-full min-w-0 [&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_code]:break-words [&_p]:break-words [&_*]:break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Pre block (wrapper for code block)
          pre: PreBlock,
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
              className="text-foreground underline underline-offset-4 decoration-muted-foreground/30 hover:decoration-foreground transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              href={href}
            >
              {children}
            </a>
          ),
        }}
      >
        {textContent}
      </ReactMarkdown>
    </div>
  );
}
