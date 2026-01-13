"use client";

import * as React from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { AssistantMessage } from "./messages/assistant-message";
import { UserMessage } from "./messages/user-message";
import type { ChatMessage } from "@/app/[lng]/home/model/types";

interface ChatMessageListProps {
  messages: ChatMessage[];
}

export function ChatMessageList({ messages }: ChatMessageListProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center px-6">
        <div className="text-center text-muted-foreground">
          <p className="text-lg mb-2">开始一个新对话</p>
          <p className="text-sm">输入消息开始与 AI 助手对话</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 min-h-0">
      <div className="px-6 py-6 space-y-4">
        {messages.map((message) =>
          message.role === "user" ? (
            <UserMessage key={message.id} content={message.content} />
          ) : (
            <AssistantMessage key={message.id} message={message} />
          ),
        )}
        <div ref={scrollRef} />
      </div>
    </ScrollArea>
  );
}
