/**
 * API Types matching backend schemas
 * Based on backend/app/schemas
 */

// ============ Response Wrapper ============

export interface ApiResponse<T> {
  data: T;
  message: string;
  code?: string;
}

// ============ Session Types ============

export interface TaskConfig {
  repo_url?: string | null;
  git_branch: string;
  mcp_config: Record<string, unknown>;
  skill_files: Record<string, unknown>;
}

export interface Session {
  session_id: string; // UUID
  user_id: string;
  sdk_session_id?: string | null;
  config_snapshot?: Record<string, unknown> | null;
  workspace_archive_url?: string | null;
  status: string;
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
}

export interface SessionCreateRequest {
  user_id: string;
  config?: TaskConfig | null;
}

export interface SessionUpdateRequest {
  status?: string | null;
  sdk_session_id?: string | null;
  workspace_archive_url?: string | null;
}

// ============ Message Types ============

export interface Message {
  id: number;
  role: string;
  content: Record<string, unknown>;
  text_preview?: string | null;
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
}

// ============ Tool Execution Types ============

export interface ToolExecution {
  id: number;
  session_id: string; // UUID
  tool_name: string;
  tool_input: Record<string, unknown>;
  tool_output?: string | null;
  status: string;
  error_message?: string | null;
  started_at: string; // ISO datetime
  completed_at?: string | null;
  created_at: string; // ISO datetime
}

// ============ Usage Types ============

export interface Usage {
  total_cost_usd?: number | null;
  total_input_tokens?: number | null;
  total_output_tokens?: number | null;
  total_duration_ms?: number | null;
}

// ============ Search Result Types ============

export interface SearchResultTask {
  id: string; // session_id
  title: string;
  status: string;
  timestamp: string;
  type: "task";
}

export interface SearchResultProject {
  id: string;
  name: string;
  taskCount?: number;
  type: "project";
}

export interface SearchResultMessage {
  id: number;
  content: string;
  chatId: string; // session_id
  timestamp: string;
  type: "message";
}

export type SearchResult =
  | SearchResultTask
  | SearchResultProject
  | SearchResultMessage;
