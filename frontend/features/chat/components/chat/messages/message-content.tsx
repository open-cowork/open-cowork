"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { MessageBlock } from "@/features/chat/types";
import type { ToolUseBlock, ToolResultBlock } from "@/features/chat/types";
import { ToolChain } from "./tool-chain";
import remarkBreaks from "remark-breaks";
import { MarkdownCode, MarkdownPre } from "@/components/shared/markdown-code";

type LinkProps = {
  children?: React.ReactNode;
  href?: string;
  ref?: React.Ref<HTMLAnchorElement>;
};

const ImgBlock = ({
  src,
  alt,
  ...props
}: React.DetailedHTMLProps<
  React.ImgHTMLAttributes<HTMLImageElement>,
  HTMLImageElement
>) => {
  if (!src) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} {...props} />;
};

export function MessageContent({
  content,
}: {
  content: string | MessageBlock[];
}) {
  // Helper function to extract text content from message
  const getTextContent = (content: string | MessageBlock[]): string => {
    const clean = (text: string) => text.replace(/\uFFFD/g, "");

    if (typeof content === "string") {
      return clean(content);
    }
    // If it's an array of blocks, extract text from TextBlock
    if (Array.isArray(content)) {
      // This helper is used for copy-paste mainly, so we just want the text parts
      const textBlocks = content.filter(
        (block: MessageBlock) => block._type === "TextBlock",
      );
      return textBlocks
        .map((block: MessageBlock) =>
          block._type === "TextBlock" ? clean(block.text) : "",
        )
        .join("\n\n");
    }
    return clean(String(content));
  };

  const textContent = getTextContent(content);

  // If content is string, render as before
  if (typeof content === "string") {
    return (
      <div className="prose prose-sm dark:prose-invert max-w-none break-words break-all w-full min-w-0 [&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_code]:break-words [&_p]:break-words [&_p]:break-all [&_*]:break-words [&_*]:break-all">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          components={{
            pre: MarkdownPre,
            code: MarkdownCode,
            a: ({ children, href, ...props }: LinkProps) => (
              <a
                className="text-foreground underline underline-offset-4 decoration-muted-foreground/30 hover:decoration-foreground transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                href={href}
                {...props}
              >
                {children}
              </a>
            ),
            h1: ({ children }) => (
              <h1 className="text-2xl font-bold mb-4 mt-6 text-foreground">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl font-bold mb-3 mt-5 text-foreground">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg font-bold mb-2 mt-4 text-foreground">
                {children}
              </h3>
            ),
            hr: () => <hr className="my-6 border-border" />,
            img: ImgBlock,
          }}
        >
          {textContent}
        </ReactMarkdown>
      </div>
    );
  }

  // Handle array of blocks (Tools + Text)
  // We need to group them: sequence of tool blocks -> ToolChain, sequence of text blocks -> Markdown
  const groups: { type: "text" | "tool"; blocks: MessageBlock[] }[] = [];
  let currentGroup: { type: "text" | "tool"; blocks: MessageBlock[] } | null =
    null;

  for (const block of content) {
    const isTool =
      block._type === "ToolUseBlock" || block._type === "ToolResultBlock";
    const type = isTool ? "tool" : "text";

    if (!currentGroup || currentGroup.type !== type) {
      currentGroup = { type, blocks: [] };
      groups.push(currentGroup);
    }
    currentGroup.blocks.push(block);
  }

  return (
    <div className="space-y-4 w-full min-w-0">
      {groups.map((group, index) => {
        if (group.type === "tool") {
          return (
            <ToolChain
              key={index}
              blocks={group.blocks as (ToolUseBlock | ToolResultBlock)[]}
            />
          );
        } else {
          const text = group.blocks
            .map((b) => (b._type === "TextBlock" ? b.text : ""))
            .join("\n\n");
          if (!text.trim()) return null;

          return (
            <div
              key={index}
              className="prose prose-sm dark:prose-invert max-w-none break-words break-all w-full min-w-0 [&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_code]:break-words [&_p]:break-words [&_p]:break-all [&_*]:break-words [&_*]:break-all"
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                components={{
                  pre: MarkdownPre,
                  code: MarkdownCode,
                  a: ({ children, href, ...props }: LinkProps) => (
                    <a
                      className="text-foreground underline underline-offset-4 decoration-muted-foreground/30 hover:decoration-foreground transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                      href={href}
                      {...props}
                    >
                      {children}
                    </a>
                  ),
                  h1: ({ children }) => (
                    <h1 className="text-2xl font-bold mb-4 mt-6 text-foreground">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xl font-bold mb-3 mt-5 text-foreground">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-lg font-bold mb-2 mt-4 text-foreground">
                      {children}
                    </h3>
                  ),
                  hr: () => <hr className="my-6 border-border" />,
                  img: ImgBlock,
                }}
              >
                {text}
              </ReactMarkdown>
            </div>
          );
        }
      })}
    </div>
  );
}
