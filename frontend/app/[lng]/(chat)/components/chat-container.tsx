"use client";

import * as React from "react";

import { useChatSession } from "../hooks/use-chat-session";
import { AVAILABLE_MODELS } from "@/app/[lng]/home/model/constants";
import type { ModelInfo } from "@/app/[lng]/home/model/types";

import { ChatHeader } from "./chat-header";
import { ChatMessageList } from "./chat-message-list";
import { ChatInput } from "./chat-input";

export interface ChatContainerProps {
  taskId?: string;
  isNewChat?: boolean;
}

export function ChatContainer({ taskId, isNewChat }: ChatContainerProps) {
  const { session, isLoading, addMessage, updateModel } = useChatSession(
    taskId || "",
    isNewChat || false,
  );
  const [inputValue, setInputValue] = React.useState("");
  const [selectedModel, setSelectedModel] = React.useState<ModelInfo>(
    AVAILABLE_MODELS[0],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  const handleSend = () => {
    if (!inputValue.trim()) return;
    addMessage(inputValue, "user");
    setInputValue("");
  };

  const handleModelChange = (model: ModelInfo) => {
    setSelectedModel(model);
    updateModel(model.id);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ChatHeader
        model={selectedModel}
        onModelChange={handleModelChange}
        title={session?.title}
      />
      <ChatMessageList messages={session?.messages || []} />
      <ChatInput
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSend}
        disabled={false}
      />
    </div>
  );
}
