export type TaskStatus = "pending" | "running" | "completed" | "failed";

export type TaskHistoryItem = {
  id: string;
  title: string;
  status: TaskStatus;
  timestamp?: string;
  projectId?: string | null; // 关联的项目ID，null表示未归类到项目
};

export type ProjectItem = {
  id: string;
  name: string;
  taskCount?: number; // 项目下的任务数量
  icon?: string; // 项目图标
};

export type ConnectedTool = {
  id: string;
  name: string;
  icon: string;
};

// Chat-related types
export type MessageRole = "user" | "assistant" | "system";

export type MessageStatus =
  | "sending"
  | "sent"
  | "streaming"
  | "completed"
  | "failed";

export type ChatMessage = {
  id: string;
  role: MessageRole;
  content: string;
  status: MessageStatus;
  timestamp?: string;
  metadata?: {
    model?: string;
    tokensUsed?: number;
    duration?: number;
    toolCalls?: ToolCall[];
  };
  parentId?: string;
};

export type ChatSession = {
  id: string;
  taskId: string;
  title: string;
  messages: ChatMessage[];
  status: TaskStatus;
  model: string;
  createdAt: string;
  updatedAt: string;
};

export type ModelInfo = {
  id: string;
  name: string;
  description: string;
  icon: string;
  provider: "anthropic" | "openai" | "google";
};

export type UsageStats = {
  credits: number;
  tokensUsed: number;
  duration: number;
  todayUsage: number;
  weekUsage: number;
  monthUsage: number;
};

export type ToolCall = {
  id: string;
  name: string;
  input: Record<string, unknown>;
  output?: string;
  status: "pending" | "running" | "completed" | "failed";
};

export type Attachment = {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
};
