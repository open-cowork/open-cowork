/**
 * API Client for backend communication
 * Base URL configured via environment variable
 */

import type {
  ApiResponse,
  Message,
  Session,
  SessionCreateRequest,
  ToolExecution,
  Usage,
} from "./api-types";

// TODO: Configure API base URL via environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Generic fetch wrapper with error handling
 */
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${API_BASE_URL}/api/v1${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const result: ApiResponse<T> = await response.json();
    return result.data;
  } catch (error) {
    console.error(`API call failed: ${endpoint}`, error);
    throw error;
  }
}

// ============ Session API ============

export const sessionApi = {
  /**
   * List all sessions (tasks)
   * GET /api/v1/sessions
   */
  list: async (params?: {
    user_id?: string;
    limit?: number;
    offset?: number;
  }): Promise<Session[]> => {
    const searchParams = new URLSearchParams();
    if (params?.user_id) searchParams.append("user_id", params.user_id);
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.offset) searchParams.append("offset", params.offset.toString());

    const query = searchParams.toString();
    return fetchApi<Session[]>(`/sessions${query ? `?${query}` : ""}`);
  },

  /**
   * Get a single session by ID
   * GET /api/v1/sessions/{session_id}
   */
  get: async (sessionId: string): Promise<Session> => {
    return fetchApi<Session>(`/sessions/${sessionId}`);
  },

  /**
   * Create a new session
   * POST /api/v1/sessions
   */
  create: async (request: SessionCreateRequest): Promise<Session> => {
    return fetchApi<Session>("/sessions", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  /**
   * Update a session
   * PATCH /api/v1/sessions/{session_id}
   */
  update: async (
    sessionId: string,
    request: SessionCreateRequest,
  ): Promise<Session> => {
    return fetchApi<Session>(`/sessions/${sessionId}`, {
      method: "PATCH",
      body: JSON.stringify(request),
    });
  },

  /**
   * Get messages for a session
   * GET /api/v1/sessions/{session_id}/messages
   */
  getMessages: async (sessionId: string): Promise<Message[]> => {
    return fetchApi<Message[]>(`/sessions/${sessionId}/messages`);
  },

  /**
   * Get tool executions for a session
   * GET /api/v1/sessions/{session_id}/tool-executions
   */
  getToolExecutions: async (sessionId: string): Promise<ToolExecution[]> => {
    return fetchApi<ToolExecution[]>(`/sessions/${sessionId}/tool-executions`);
  },

  /**
   * Get usage statistics for a session
   * GET /api/v1/sessions/{session_id}/usage
   */
  getUsage: async (sessionId: string): Promise<Usage> => {
    return fetchApi<Usage>(`/sessions/${sessionId}/usage`);
  },
};
