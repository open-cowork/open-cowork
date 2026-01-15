/**
 * App-level UI types (frontend-specific)
 */

export interface ModelInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  provider: "anthropic" | "openai" | "google";
}

export interface UsageStats {
  credits: number;
  tokensUsed: number;
  duration: number;
  todayUsage: number;
  weekUsage: number;
  monthUsage: number;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface ConnectedTool {
  id: string;
  name: string;
  icon: string;
}

export interface UserProfile {
  id: string;
  email: string;
  avatar?: string;
  plan: "free" | "pro" | "team";
  planName: string;
}

export interface UserCredits {
  total: number | string;
  free: number | string;
  dailyRefreshCurrent: number;
  dailyRefreshMax: number;
  refreshTime: string;
}

export interface Skill {
  id: string;
  nameKey: string;
  descKey: string;
  source: string;
}

// Legacy types for sidebar/search (to be migrated)
export interface ProjectItem {
  id: string;
  name: string;
  icon?: string;
  taskCount: number;
}

export interface TaskHistoryItem {
  id: string;
  title: string;
  timestamp: string;
  status: "pending" | "running" | "completed" | "failed";
  projectId?: string;
}

export interface SearchResultTask {
  id: string;
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
  chatId: string;
  timestamp: string;
  type: "message";
}

export type SearchResult =
  | SearchResultTask
  | SearchResultProject
  | SearchResultMessage;
