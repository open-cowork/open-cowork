"use client";

import * as React from "react";
import { ChevronDown, ChevronUp, Copy, Check, Pencil } from "lucide-react";
import { FileCard } from "@/components/shared/file-card";
import { Button } from "@/components/ui/button";
import type { MessageBlock, InputFile } from "@/features/chat/types";
import { useT } from "@/lib/i18n/client";

const MAX_LINES = 5;

export function UserMessage({
  content,
  attachments,
  onEdit,
}: {
  content: string | MessageBlock[];
  attachments?: InputFile[];
  onEdit?: (content: string) => void;
}) {
  const { t } = useT("translation");
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [shouldCollapse, setShouldCollapse] = React.useState(false);
  const [isCopied, setIsCopied] = React.useState(false);
  const observerRef = React.useRef<HTMLParagraphElement>(null);

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

  // Copy handler
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(textContent);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy message", err);
    }
  };

  // Edit handler
  const handleEdit = () => {
    onEdit?.(textContent);
  };

  // Check if content overflows using ResizeObserver
  React.useEffect(() => {
    const element = observerRef.current;
    if (!element) return;

    const checkOverflow = () => {
      // Compare scrollHeight with client height to detect overflow
      const lineHeight = parseFloat(getComputedStyle(element).lineHeight);
      const thresholdHeight = lineHeight * MAX_LINES;
      setShouldCollapse(element.scrollHeight > thresholdHeight + 1); // +1 for rounding
    };

    // Initial check
    checkOverflow();

    // Observe size changes
    const observer = new ResizeObserver(checkOverflow);
    observer.observe(element);

    return () => observer.disconnect();
  }, [textContent]);

  return (
    <div className="flex flex-col items-end w-full gap-2">
      {attachments && attachments.length > 0 && (
        <div className="max-w-[85%] flex flex-wrap justify-end gap-2">
          {attachments.map((file, i) => (
            <FileCard key={i} file={file} className="w-48" showRemove={false} />
          ))}
        </div>
      )}
      {textContent && (
        <div className="max-w-[85%] flex flex-col items-end gap-2 group">
          <div className="bg-muted text-foreground rounded-lg px-4 py-2 w-full">
            <p
              ref={observerRef}
              className={`text-base whitespace-pre-wrap break-words break-all ${
                shouldCollapse && !isExpanded ? "line-clamp-5" : ""
              }`}
            >
              {textContent}
            </p>
          </div>
          <div className="flex items-center justify-between w-full gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {shouldCollapse && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    {t("chat.collapse")}
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    {t("chat.expand")}
                  </>
                )}
              </button>
            )}
            <div className="flex items-center gap-1 ml-auto">
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-foreground"
                onClick={onCopy}
                title={t("chat.copyMessage")}
              >
                {isCopied ? (
                  <Check className="size-3.5" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-foreground"
                onClick={handleEdit}
                title={t("chat.editMessage")}
              >
                <Pencil className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
