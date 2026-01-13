import type { TFunction } from "i18next";

import type {
  ChatSession,
  ProjectItem,
  TaskHistoryItem,
  UsageStats,
} from "./types";

export function createMockProjects(t: TFunction): ProjectItem[] {
  return [
    {
      id: "p-1",
      name: t("mocks.projects.newProject"),
      taskCount: 2,
      icon: "📁",
    },
    {
      id: "p-2",
      name: "前端重构",
      taskCount: 3,
      icon: "⚛️",
    },
    {
      id: "p-3",
      name: "API 开发",
      taskCount: 1,
      icon: "🔧",
    },
  ];
}

export function createMockTaskHistory(t: TFunction): TaskHistoryItem[] {
  return [
    {
      id: "1",
      title: t("mocks.taskHistory.refactorFrontend"),
      status: "completed",
      timestamp: t("mocks.timestamps.twoMinutesAgo"),
      projectId: "p-2", // 关联到"前端重构"项目
    },
    {
      id: "2",
      title: t("mocks.taskHistory.researchClaude"),
      status: "running",
      timestamp: t("mocks.timestamps.oneHourAgo"),
      projectId: null, // 未关联到项目
    },
    {
      id: "3",
      title: "实现用户认证功能",
      status: "pending",
      timestamp: t("mocks.timestamps.justNow"),
      projectId: "p-2", // 关联到"前端重构"项目
    },
    {
      id: "4",
      title: "优化数据库查询",
      status: "completed",
      timestamp: t("mocks.timestamps.twoMinutesAgo"),
      projectId: "p-3", // 关联到"API 开发"项目
    },
    {
      id: "5",
      title: "添加单元测试",
      status: "pending",
      timestamp: t("mocks.timestamps.oneHourAgo"),
      projectId: "p-2", // 关联到"前端重构"项目
    },
  ];
}

// Chat-related mock data
export function createMockChatSession(t: TFunction): ChatSession {
  return {
    id: "session-1",
    taskId: "1",
    title: t("mocks.taskHistory.refactorFrontend"),
    status: "completed",
    model: "claude-sonnet-4.5",
    createdAt: "2024-01-13T10:00:00Z",
    updatedAt: "2024-01-13T10:30:00Z",
    messages: [
      {
        id: "msg-1",
        role: "user",
        content: "帮我重构前端的代码",
        status: "completed",
        timestamp: "2024-01-13T10:00:00Z",
      },
      {
        id: "msg-2",
        role: "assistant",
        content: `# 代码重构方案

我分析了你的前端代码，以下是重构建议：

## 1. 组件结构优化

\`\`\`typescript
// 建议的目录结构
components/
  ├── common/        // 通用组件
  ├── features/      // 功能组件
  └── layouts/       // 布局组件
\`\`\`

## 2. 状态管理

建议使用 React Context + hooks 管理全局状态。

## 3. 样式统一

使用 Tailwind CSS v4 的设计系统变量。

需要我详细展开哪个部分？`,
        status: "completed",
        timestamp: "2024-01-13T10:01:00Z",
        metadata: {
          model: "claude-sonnet-4.5",
          tokensUsed: 250,
          duration: 3000,
        },
      },
      {
        id: "msg-3",
        role: "user",
        content: "请详细展开组件结构优化部分",
        status: "completed",
        timestamp: "2024-01-13T10:05:00Z",
      },
      {
        id: "msg-4",
        role: "assistant",
        content: `# 组件结构优化详解

## 目录结构设计

\`\`\`typescript
src/
  components/
    ├── common/
    │   ├── Button/
    │   │   ├── Button.tsx
    │   │   ├── Button.test.tsx
    │   │   └── index.ts
    │   ├── Input/
    │   └── Card/
    ├── features/
    │   ├── TaskList/
    │   │   ├── TaskList.tsx
    │   │   ├── TaskItem.tsx
    │   │   └── index.ts
    │   └── Chat/
    └── layouts/
        ├── MainLayout.tsx
        └── AuthLayout.tsx
\`\`\`

## 组件设计原则

1. **单一职责**: 每个组件只做一件事
2. **可复用性**: 通过 props 控制行为
3. **可测试性**: 纯函数组件优先

继续详细说明吗？`,
        status: "completed",
        timestamp: "2024-01-13T10:06:00Z",
        metadata: {
          model: "claude-sonnet-4.5",
          tokensUsed: 380,
          duration: 4500,
        },
      },
    ],
  };
}

export function createMockUsageStats(): UsageStats {
  return {
    credits: 4300,
    tokensUsed: 1234,
    duration: 150,
    todayUsage: 12500,
    weekUsage: 67800,
    monthUsage: 245000,
  };
}

export function createMockNewChatSession(): ChatSession {
  return {
    id: `session-${Date.now()}`,
    taskId: `task-${Date.now()}`,
    title: "新对话",
    status: "pending",
    model: "claude-sonnet-4.5",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [],
  };
}
