"use client";

import * as React from "react";
import { ChatMessageList } from "../chat-message-list";
import { ChatInput } from "../chat-input";
import { MessageSquare } from "lucide-react";
import type { ExecutionSession } from "../../model/execution-types";
import type { ChatMessage } from "@/app/[lng]/home/model/types";

interface ChatPanelProps {
  session: ExecutionSession | null;
}

export function ChatPanel({ session }: ChatPanelProps) {
  const [inputValue, setInputValue] = React.useState("");
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);

  // 当 session 有 user_prompt 时，显示用户的消息
  React.useEffect(() => {
    if (session?.user_prompt && messages.length === 0) {
      const userMessage: ChatMessage = {
        id: `msg-initial-${session.session_id}`,
        role: "user",
        content: session.user_prompt,
        status: "sent",
        timestamp: session.time,
      };
      setMessages([userMessage]);
    }
  }, [
    session?.user_prompt,
    session?.time,
    session?.session_id,
    messages.length,
  ]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    // TODO: Implement message sending logic
    console.log("Sending message:", inputValue);
    setInputValue("");
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-card shrink-0 min-h-[85px] flex flex-col justify-center">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 shrink-0">
            <MessageSquare className="size-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold text-foreground truncate">
              {session?.task_name || session?.new_message?.title || "对话"}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              与 AI 助手交互，提出问题和需求
            </p>
          </div>
        </div>
      </div>

      {/* Message list */}
      <div className="flex-1 min-h-0">
        <ChatMessageList messages={messages} />
      </div>

      {/* Input */}
      <div className="shrink-0">
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSend}
        />
      </div>
    </div>
  );
}
