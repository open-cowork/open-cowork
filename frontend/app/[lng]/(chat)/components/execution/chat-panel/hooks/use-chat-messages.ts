import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { chatApi } from "@/lib/api/chat";
import type { ChatMessage, ExecutionSession } from "@/lib/types";

interface UseChatMessagesOptions {
  session: ExecutionSession | null;
}

interface UseChatMessagesReturn {
  messages: ChatMessage[];
  displayMessages: ChatMessage[];
  isLoadingHistory: boolean;
  isTyping: boolean;
  showTypingIndicator: boolean;
  sendMessage: (content: string) => Promise<void>;
}

/**
 * Manages chat message loading, polling, and optimistic updates
 *
 * Responsibilities:
 * - Load message history when session changes
 * - Poll for new messages during active sessions
 * - Merge local optimistic messages with server messages
 * - Calculate display messages with streaming status
 * - Handle typing indicator state
 */
export function useChatMessages({
  session,
}: UseChatMessagesOptions): UseChatMessagesReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const lastLoadedSessionIdRef = useRef<string | null>(null);

  // Helper to merge new server messages with local optimistic messages
  const mergeMessages = useCallback(
    (currentMessages: ChatMessage[], serverMessages: ChatMessage[]) => {
      const finalMessages = [...serverMessages];

      // Append local optimistic messages that haven't been synced yet
      currentMessages.forEach((localMsg) => {
        // Only care about optimistic messages (id starts with "msg-")
        if (!localMsg.id.startsWith("msg-")) return;

        // Check if this optimistic message is already present in server messages
        const isSynced = serverMessages.some((serverMsg) => {
          if (
            serverMsg.role !== localMsg.role ||
            serverMsg.content !== localMsg.content
          ) {
            return false;
          }

          // Timestamp check - allow 10s skew/lag
          const localTime = localMsg.timestamp
            ? new Date(localMsg.timestamp).getTime()
            : Date.now();
          const serverTime = serverMsg.timestamp
            ? new Date(serverMsg.timestamp).getTime()
            : 0;

          return serverTime >= localTime - 10000;
        });

        if (!isSynced) {
          finalMessages.push(localMsg);
        }
      });

      // Sort by timestamp
      return finalMessages.sort((a, b) => {
        const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return timeA - timeB;
      });
    },
    [],
  );

  // Send message and immediately fetch updated messages
  const sendMessage = useCallback(
    async (content: string) => {
      if (!session?.session_id) return;

      const sessionId = session.session_id;
      console.log(`[Chat] Sending message to session ${sessionId}:`, content);
      setIsTyping(true);

      // Create a new user message for instant UI update
      const newMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: "user",
        content,
        status: "sent",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, newMessage]);

      try {
        await chatApi.sendMessage(sessionId, content);
        console.log("[Chat] Message sent successfully");

        // Fetch latest messages immediately to confirm sync
        const serverMessages = await chatApi.getMessages(sessionId);
        setMessages((prev) => mergeMessages(prev, serverMessages));
      } catch (error) {
        console.error("[Chat] Failed to send message or get reply:", error);
        setIsTyping(false);
      }
    },
    [session, mergeMessages],
  );

  // Load and poll for messages
  useEffect(() => {
    if (!session?.session_id) return;

    // Only set loading if it's a NEW session
    if (lastLoadedSessionIdRef.current !== session.session_id) {
      setIsLoadingHistory(true);
      lastLoadedSessionIdRef.current = session.session_id;
    }

    const fetchMessages = async () => {
      try {
        const historyMessages = await chatApi.getMessages(session.session_id);

        setMessages((prev) => {
          // If it's the first load (empty prev), just set it
          // Otherwise merge
          return mergeMessages(prev, historyMessages);
        });
      } catch (error) {
        console.error("[Chat] Failed to load messages:", error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    // Initial fetch
    fetchMessages();

    // Setup polling if active
    let interval: NodeJS.Timeout;
    const isActive =
      session.status === "running" || session.status === "accepted";

    if (isActive) {
      interval = setInterval(fetchMessages, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [session?.session_id, session?.status, mergeMessages]);

  // Manage isTyping state based on messages
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === "assistant" || lastMsg.role === "system") {
        setIsTyping(false);
      }
    }
  }, [messages]);

  // Determine if session is running/active
  const isSessionActive =
    session?.status === "running" || session?.status === "accepted";

  // Calculate messages for display
  const displayMessages = useMemo(() => {
    if (!isSessionActive || messages.length === 0) return messages;

    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role === "assistant") {
      // Show streaming status if assistant is last message and session is running
      return [
        ...messages.slice(0, -1),
        { ...lastMsg, status: "streaming" as const },
      ];
    }
    return messages;
  }, [messages, isSessionActive]);

  // Determine if we should show the typing indicator
  const showTypingIndicator =
    isTyping ||
    (isSessionActive &&
      (messages.length === 0 || messages[messages.length - 1].role === "user"));

  return {
    messages,
    displayMessages,
    isLoadingHistory,
    isTyping,
    showTypingIndicator,
    sendMessage,
  };
}
