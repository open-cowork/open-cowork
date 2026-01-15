"use client";

import type { MessageBlock } from "@/lib/api-types";

export function UserMessage({ content }: { content: string | MessageBlock[] }) {
  // Parse content if it's an array of blocks
  const parseContent = (content: string | MessageBlock[]): string => {
    if (typeof content === "string") {
      return content;
    }

    // Filter out ToolResultBlock and only keep TextBlock
    const textBlocks = content.filter(
      (block): block is { _type: "TextBlock"; text: string } =>
        block._type === "TextBlock",
    );

    // Join all text blocks with newlines
    return textBlocks.map((block) => block.text).join("\n\n");
  };

  const textContent = parseContent(content);

  return (
    <div className="flex justify-end mb-4 w-full">
      <div className="max-w-[85%] bg-muted text-foreground rounded-lg px-4 py-2">
        <p className="whitespace-pre-wrap break-words">{textContent}</p>
      </div>
    </div>
  );
}
