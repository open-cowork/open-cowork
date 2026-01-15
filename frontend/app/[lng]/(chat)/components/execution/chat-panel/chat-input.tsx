import { useState, useCallback, useRef } from "react";
import { SendHorizontal } from "lucide-react";

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

/**
 * Chat input component with send button
 *
 * @example
 * ```tsx
 * <ChatInput
 *   onSend={(content) => console.log(content)}
 * />
 * ```
 */
export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [value, setValue] = useState("");
  // Track whether user is composing with IME (Input Method Editor)
  const isComposingRef = useRef(false);

  const handleSend = useCallback(() => {
    if (!value.trim()) return;

    const content = value;
    setValue(""); // Clear immediately
    onSend(content);
  }, [value, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Only send on Enter if not composing (IME input in progress)
      if (
        e.key === "Enter" &&
        !e.shiftKey &&
        value.trim() &&
        !isComposingRef.current
      ) {
        e.preventDefault();
        handleSend();
      }
    },
    [value, handleSend],
  );

  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true;
  }, []);

  const handleCompositionEnd = useCallback(() => {
    isComposingRef.current = false;
  }, []);

  return (
    <div className="shrink-0 px-4 pb-4 pt-2">
      <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          placeholder=""
          disabled={disabled}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          className="flex items-center justify-center size-8 rounded-md bg-foreground text-background hover:bg-foreground/90 disabled:bg-muted disabled:text-muted-foreground transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          <SendHorizontal className="size-4" />
        </button>
      </div>
    </div>
  );
}
