"use client";

import * as React from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { AssistantMessage } from "./messages/assistant-message";
import { UserMessage } from "./messages/user-message";
import type { ChatMessage } from "@/lib/api-types";

export interface ChatMessageListProps {
  messages: ChatMessage[];
  isTyping?: boolean;
}

export function ChatMessageList({ messages, isTyping }: ChatMessageListProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  if (messages.length === 0 && !isTyping) {
    return null;
  }

  return (
    <div className="h-full overflow-hidden">
      <ScrollArea className="h-full">
        <div className="px-6 py-6 space-y-4 w-full min-w-0 max-w-full">
          {messages.map((message) =>
            message.role === "user" ? (
              <UserMessage key={message.id} content={message.content} />
            ) : (
              <AssistantMessage key={message.id} message={message} />
            ),
          )}
          {isTyping && (
            <AssistantMessage
              message={{
                id: "typing",
                role: "assistant",
                content: "",
                status: "streaming",
                timestamp: new Date().toISOString(),
              }}
            />
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>
    </div>
  );
}
