import type { LucideIcon } from "lucide-react";
import {
  Code,
  Globe,
  MoreHorizontal,
  Palette,
  Presentation,
} from "lucide-react";

import type { ConnectedTool, TaskStatus } from "./types";

export type QuickAction = {
  id: string;
  labelKey: string;
  icon: LucideIcon;
};

export const QUICK_ACTIONS: QuickAction[] = [
  { id: "slides", labelKey: "prompts.createSlides", icon: Presentation },
  { id: "website", labelKey: "prompts.createWebsite", icon: Globe },
  { id: "app", labelKey: "prompts.developApp", icon: Code },
  { id: "design", labelKey: "prompts.design", icon: Palette },
  { id: "more", labelKey: "prompts.more", icon: MoreHorizontal },
];

export const CONNECTED_TOOLS: ConnectedTool[] = [
  { id: "gmail", name: "Gmail", icon: "📧" },
  { id: "drive", name: "Drive", icon: "📁" },
  { id: "notion", name: "Notion", icon: "📝" },
  { id: "slack", name: "Slack", icon: "💬" },
  { id: "figma", name: "Figma", icon: "🎨" },
];

export const TASK_STATUS_META: Record<
  TaskStatus,
  { dotClassName: string; labelKey: string }
> = {
  pending: {
    dotClassName: "bg-muted-foreground/40",
    labelKey: "status.pending",
  },
  running: { dotClassName: "bg-chart-2", labelKey: "status.running" },
  completed: { dotClassName: "bg-chart-1", labelKey: "status.completed" },
  failed: { dotClassName: "bg-destructive", labelKey: "status.failed" },
};
