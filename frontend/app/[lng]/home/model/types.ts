export type TaskStatus = "pending" | "running" | "completed" | "failed";

export type TaskHistoryItem = {
  id: string;
  title: string;
  status: TaskStatus;
  timestamp?: string;
};

export type ProjectItem = {
  id: string;
  name: string;
};

export type ConnectedTool = {
  id: string;
  name: string;
  icon: string;
};
