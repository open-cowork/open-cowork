"use client";

import * as React from "react";

import { useT } from "@/app/i18n/client";
import { STREAMING_CHAR_DELAY } from "@/app/[lng]/home/model/constants";
import { createMockNewChatSession } from "@/app/[lng]/home/model/mocks";
import { createMockNewSession } from "../model/execution-mocks";
import type {
  ChatMessage,
  ChatSession,
  MessageRole,
} from "@/app/[lng]/home/model/types";

export function useChatSession(taskId: string, isNewChat: boolean = false) {
  const { t } = useT("translation");
  const [session, setSession] = React.useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Load session data on mount
  React.useEffect(() => {
    setIsLoading(true);
    // Simulate API delay
    const timer = setTimeout(() => {
      if (isNewChat) {
        setSession(createMockNewChatSession());
      } else if (taskId) {
        // TODO: 加载已有会话
        setSession(createMockNewChatSession());
      }
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [taskId, isNewChat, t]);

  // Simulate AI streaming response (declared before addMessage to avoid hoisting issue)
  const simulateAIResponse = React.useCallback(
    (userMessage: string) => {
      const aiMessageId = `msg-${Date.now()}`;
      const responseContent = `我理解你的需求了。让我分析一下"${userMessage}"这个问题。

## 分析结果

基于你提供的信息，我建议：

1. **第一步**: 仔细分析需求
2. **第二步**: 制定详细方案
3. **第三步**: 逐步实施

需要我详细展开某个部分吗？`;

      // Add empty AI message first
      const emptyMessage: ChatMessage = {
        id: aiMessageId,
        role: "assistant",
        content: "",
        status: "streaming",
        timestamp: new Date().toISOString(),
        metadata: {
          model: session?.model || "claude-sonnet-4.5",
          tokensUsed: 0,
          duration: 0,
        },
      };

      setSession((prev) => ({
        ...prev!,
        messages: [...prev!.messages, emptyMessage],
      }));

      // Simulate streaming
      let currentContent = "";
      const chunks = responseContent.split("");

      chunks.forEach((char, index) => {
        setTimeout(() => {
          currentContent += char;
          setSession((prev) => ({
            ...prev!,
            messages: prev!.messages.map((msg) =>
              msg.id === aiMessageId
                ? {
                    ...msg,
                    content: currentContent,
                    metadata: {
                      ...msg.metadata,
                      tokensUsed: currentContent.length,
                      duration: index * STREAMING_CHAR_DELAY,
                    },
                  }
                : msg,
            ),
          }));

          // Mark as completed on last character
          if (index === chunks.length - 1) {
            setSession((prev) => ({
              ...prev!,
              messages: prev!.messages.map((msg) =>
                msg.id === aiMessageId
                  ? { ...msg, status: "completed" as const }
                  : msg,
              ),
              updatedAt: new Date().toISOString(),
            }));
          }
        }, index * STREAMING_CHAR_DELAY);
      });
    },
    [session],
  );

  // Add a new message to the session
  const addMessage = React.useCallback(
    (content: string, role: MessageRole) => {
      if (!session) return;

      // 添加用户消息到本地状态
      const newMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role,
        content,
        status: role === "user" ? "sent" : "streaming",
        timestamp: new Date().toISOString(),
      };

      setSession((prev) => ({
        ...prev!,
        messages: [...prev!.messages, newMessage],
        updatedAt: new Date().toISOString(),
        title:
          prev!.messages.length === 0
            ? content.slice(0, 50) + (content.length > 50 ? "..." : "")
            : prev!.title,
      }));

      // 如果是用户消息，创建执行会话并跳转
      if (role === "user") {
        // 模拟API延迟后创建会话并跳转
        setTimeout(() => {
          const mockSession = createMockNewSession(content);
          // 保存用户 prompt 到 localStorage，供执行页面使用
          localStorage.setItem(
            `session_prompt_${mockSession.session_id}`,
            content,
          );
          // 跳转到执行页面
          window.location.href = `/chat/${mockSession.session_id}`;
        }, 500);
      } else {
        // 如果是助手消息，模拟流式响应
        simulateAIResponse(content);
      }
    },
    [session, simulateAIResponse],
  );

  // Update session model
  const updateModel = React.useCallback((modelId: string) => {
    setSession((prev) => (prev ? { ...prev, model: modelId } : null));
  }, []);

  return {
    session,
    isLoading,
    addMessage,
    updateModel,
  };
}
