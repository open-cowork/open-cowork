// Execution session types for AI execution interface

/**
 * Todo item status
 */
export type TodoStatus = "pending" | "in_progress" | "completed";

/**
 * Todo item
 */
export type TodoItem = {
  content: string;
  status: TodoStatus;
  active_form: string | null;
};

/**
 * MCP server status
 */
export type McpServerStatus = "connected" | "disconnected" | "error";

/**
 * MCP status item
 */
export type McpStatusItem = {
  server_name: string;
  status: McpServerStatus;
  message: string | null;
};

/**
 * File change status
 */
export type FileChangeStatus = "added" | "modified" | "deleted" | "renamed";

/**
 * File change item
 */
export type FileChange = {
  path: string;
  status: FileChangeStatus;
  added_lines: number;
  deleted_lines: number;
  diff: string | null;
  old_path: string | null;
};

/**
 * Workspace state
 */
export type WorkspaceState = {
  repository: string | null;
  branch: string | null;
  total_added_lines: number;
  total_deleted_lines: number;
  file_changes: FileChange[];
  last_change: string;
};

/**
 * Artifact types - various output types from AI execution
 */
export type ArtifactType =
  | "text"
  | "code_diff"
  | "image"
  | "ppt"
  | "pdf"
  | "markdown"
  | "json";

/**
 * Artifact item - represents any output from AI execution
 */
export type Artifact = {
  id: string;
  type: ArtifactType;
  title: string;
  content?: string; // For text, markdown, json, code_diff
  url?: string; // For image, ppt, pdf
  metadata?: {
    language?: string; // For code_diff
    size?: number; // File size in bytes
    format?: string; // Additional format info
  };
  created_at: string;
};

/**
 * Skill use - tracks which AI skills/tools were used
 */
export type SkillUse = {
  id: string;
  name: string;
  description: string;
  status: "pending" | "running" | "completed" | "failed";
  duration?: number; // in milliseconds
  created_at: string;
};

/**
 * State patch from API
 */
export type StatePatch = {
  todos?: TodoItem[];
  mcp_status?: McpStatusItem[];
  workspace_state?: WorkspaceState;
  artifacts?: Artifact[]; // Various outputs from AI
  skills_used?: SkillUse[]; // Skills/tools used
  current_step?: string;
};

/**
 * Execution session status
 */
export type ExecutionStatus = "accepted" | "running" | "completed" | "failed";

/**
 * New message
 */
export type NewMessage = {
  title: string;
};

/**
 * Execution session
 */
export type ExecutionSession = {
  session_id: string;
  time: string;
  status: ExecutionStatus;
  progress: number;
  new_message?: NewMessage;
  state_patch: StatePatch;
  task_name?: string; // Task name for left panel header
  user_prompt?: string; // User's initial prompt/message
};
