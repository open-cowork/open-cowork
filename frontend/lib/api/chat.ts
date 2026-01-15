/**
 * Chat API - Session execution and messaging
 * Uses real API calls
 */

import { sessionApi, taskApi } from "../api-client";
import type {
  ExecutionSession,
  FileNode,
  ChatMessage,
  SessionResponse,
  TaskEnqueueResponse,
} from "../api-types";

/**
 * Convert backend SessionResponse to frontend ExecutionSession format
 */
function toExecutionSession(
  session: SessionResponse,
  progress: number = 0,
): ExecutionSession {
  return {
    session_id: session.session_id,
    time: session.updated_at,
    status:
      session.status === "completed"
        ? "completed"
        : session.status === "failed"
          ? "failed"
          : session.status === "running"
            ? "running"
            : "accepted",
    progress,
    state_patch: session.state_patch ?? {},
    task_name: undefined,
    user_prompt: undefined,
  };
}

/**
 * Create a default empty execution session for error cases
 */
function createDefaultSession(sessionId: string): ExecutionSession {
  return {
    session_id: sessionId,
    time: new Date().toISOString(),
    status: "accepted",
    progress: 0,
    state_patch: {},
    task_name: undefined,
    user_prompt: undefined,
  };
}

export const chatApi = {
  /**
   * Get execution session state
   */
  getSession: async (
    sessionId: string,
    currentProgress: number = 0,
  ): Promise<ExecutionSession> => {
    try {
      const session = await sessionApi.get(sessionId);
      return toExecutionSession(session, currentProgress);
    } catch (error) {
      console.error("[Chat API] Failed to get session:", error);
      return createDefaultSession(sessionId);
    }
  },

  /**
   * Create new execution session with a prompt
   */
  createSession: async (
    prompt: string,
    userId: string = "default-user",
  ): Promise<TaskEnqueueResponse> => {
    return taskApi.enqueue({
      user_id: userId,
      prompt,
      schedule_mode: "immediate",
    });
  },

  /**
   * Send message to existing session (continues the conversation)
   */
  sendMessage: async (
    sessionId: string,
    content: string,
    userId: string = "default-user",
  ): Promise<TaskEnqueueResponse> => {
    return taskApi.enqueue({
      user_id: userId,
      prompt: content,
      session_id: sessionId,
      schedule_mode: "immediate",
    });
  },

  /**
   * Get messages for a session
   */
  getMessages: async (sessionId: string): Promise<ChatMessage[]> => {
    try {
      const messages = await sessionApi.getMessages(sessionId);
      const processedMessages = messages
        .map((msg) => {
          let content = "";

          // msg.content is always Record<string, unknown>
          if (msg.content) {
            const contentObj = msg.content;

            // Skip system init messages - they are internal and should not be displayed
            if (
              contentObj._type === "SystemMessage" &&
              contentObj.subtype === "init"
            ) {
              return null; // Will be filtered out
            }

            // Extract displayable content from various message types
            // Priority: result > text > message (from content object)
            if (contentObj._type === "ResultMessage" && contentObj.result) {
              content = String(contentObj.result);
            } else if (contentObj.result) {
              content = String(contentObj.result);
            } else if (contentObj.text) {
              content = String(contentObj.text);
            } else if (contentObj.message) {
              content = String(contentObj.message);
            }
          }

          // Fallback to text_preview only if we couldn't extract from content
          if (!content && msg.text_preview) {
            content = msg.text_preview;
          }

          // Skip messages with no displayable content
          if (!content) {
            return null;
          }

          return {
            id: msg.id.toString(),
            role: msg.role as "user" | "assistant" | "system",
            content,
            status: "completed" as const,
            timestamp: msg.created_at,
          };
        })
        .filter((msg): msg is NonNullable<typeof msg> => msg !== null);

      // Deduplicate messages: if one message's content is a prefix of another, keep only the longer one
      const deduplicatedMessages: typeof processedMessages = [];
      for (const msg of processedMessages) {
        // Check if this message is a prefix of an existing message or vice versa
        let shouldAdd = true;
        let indexToRemove = -1;

        for (let i = 0; i < deduplicatedMessages.length; i++) {
          const existing = deduplicatedMessages[i];
          // Skip if different roles
          if (existing.role !== msg.role) continue;

          // Check if one content is a prefix of the other
          if (existing.content.startsWith(msg.content)) {
            // Existing is longer or equal, skip adding this message
            shouldAdd = false;
            break;
          } else if (msg.content.startsWith(existing.content)) {
            // New message is longer, replace existing
            indexToRemove = i;
            break;
          }
        }

        if (indexToRemove >= 0) {
          deduplicatedMessages.splice(indexToRemove, 1);
        }
        if (shouldAdd) {
          deduplicatedMessages.push(msg);
        }
      }

      return deduplicatedMessages;
    } catch (error) {
      console.error("[Chat API] Failed to get messages:", error);
      return [];
    }
  },

  /**
   * Get workspace files for a session
   */
  getFiles: async (sessionId?: string): Promise<FileNode[]> => {
    if (!sessionId) {
      return [];
    }

    try {
      const files = await sessionApi.getWorkspaceFiles(sessionId);

      // Helper to recursively fix URLs
      // Backend might return localhost URLs or incorrect paths, so we reconstruct them on frontend
      const fixUrls = (nodes: FileNode[]): FileNode[] => {
        return nodes.map((node) => ({
          ...node,
          url: sessionApi.getWorkspaceFileUrl(sessionId, node.path),
          children: node.children ? fixUrls(node.children) : node.children,
        }));
      };

      return fixUrls(files);
    } catch (error) {
      console.error("[Chat API] Failed to get files:", error);
      return [];
    }
  },

  /**
   * Get file download/preview URL
   */
  getFileUrl: (sessionId: string, filePath: string): string => {
    return sessionApi.getWorkspaceFileUrl(sessionId, filePath);
  },
};
