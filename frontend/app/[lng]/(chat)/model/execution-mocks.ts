// Mock data for execution session demo

import type { ExecutionSession } from "./execution-types";

/**
 * 生成随机UUID
 */
function generateUUID(): string {
  return "session-" + Math.random().toString(36).substring(2, 15);
}

/**
 * 创建新会话的Mock数据
 * 用户发送第一条消息时调用，生成新的session_id并跳转
 */
export function createMockNewSession(prompt: string): ExecutionSession {
  const sessionId = generateUUID();

  return {
    session_id: sessionId,
    time: new Date().toISOString(),
    status: "accepted",
    progress: 0,
    task_name: prompt.slice(0, 50) + (prompt.length > 50 ? "..." : ""),
    user_prompt: prompt, // 保存用户完整的输入
    new_message: {
      title: prompt.slice(0, 50) + (prompt.length > 50 ? "..." : ""),
    },
    state_patch: {
      current_step: "初始化中...",
      todos: [],
      mcp_status: [],
      workspace_state: undefined,
      artifacts: [],
      skills_used: [],
    },
  };
}

/**
 * 模拟会话状态更新（用于轮询）
 * 根据当前进度生成下一阶段的数据
 */
export function simulateSessionProgress(
  sessionId: string,
  currentProgress: number,
): ExecutionSession {
  // 每次增加5-15%的进度，模拟真实执行过程
  const increment = 5 + Math.random() * 10;
  const progress = Math.min(currentProgress + increment, 100);
  const status = progress >= 100 ? "completed" : "running";

  return {
    session_id: sessionId,
    time: new Date().toISOString(),
    status,
    progress: Math.round(progress),
    task_name: "AI 任务执行中",
    new_message: {
      title: "任务执行中",
    },
    state_patch: {
      todos: generateMockTodos(progress),
      mcp_status: generateMockMcpStatus(),
      workspace_state: generateMockWorkspaceState(progress),
      artifacts: generateMockArtifacts(progress),
      skills_used: generateMockSkills(progress),
      current_step: generateMockCurrentStep(progress),
    },
  };
}

/**
 * 生成Mock Todo列表
 * 根据进度动态更新todo状态
 */
function generateMockTodos(progress: number) {
  const getStatus = (
    completedThreshold: number,
    inProgressThreshold: number,
  ): "pending" | "in_progress" | "completed" => {
    if (progress > completedThreshold) return "completed";
    if (progress > inProgressThreshold) return "in_progress";
    return "pending";
  };

  const allTodos = [
    {
      content: "分析现有代码结构",
      status: "completed" as const,
      active_form: "正在分析中",
    },
    {
      content: "设计组件架构",
      status: "completed" as const,
      active_form: "正在设计中",
    },
    {
      content: "实现核心组件",
      status: getStatus(30, 0),
      active_form: "正在实现中",
    },
    {
      content: "集成API接口",
      status: getStatus(60, 30),
      active_form: "正在集成中",
    },
    {
      content: "编写单元测试",
      status: getStatus(80, 60),
      active_form: "正在测试中",
    },
    {
      content: "性能优化",
      status: getStatus(90, 80),
      active_form: "正在优化中",
    },
  ];

  return allTodos;
}

/**
 * 生成Mock MCP状态
 */
function generateMockMcpStatus() {
  return [
    { server_name: "github-mcp", status: "connected" as const, message: null },
    {
      server_name: "gitlab-mcp",
      status: "disconnected" as const,
      message: "未配置",
    },
    {
      server_name: "database-mcp",
      status: "connected" as const,
      message: null,
    },
    {
      server_name: "file-system-mcp",
      status: "connected" as const,
      message: null,
    },
  ];
}

/**
 * 生成Mock工作区状态
 */
function generateMockWorkspaceState(progress: number) {
  const fileChanges = [
    {
      path: "frontend/components/ChatContainer.tsx",
      status: "modified" as const,
      added_lines: 45,
      deleted_lines: 12,
      diff: '@@ -1,10 +1,15 @@\n+import { useState } from "react";\n export function ChatContainer() {',
      old_path: null,
    },
    {
      path: "frontend/hooks/useChatSession.ts",
      status: "added" as const,
      added_lines: 120,
      deleted_lines: 0,
      diff: "+export function useChatSession() {\n+  const [session, setSession] = useState();",
      old_path: null,
    },
  ];

  return {
    repository: "github.com/user/open-cowork",
    branch: "main",
    total_added_lines: Math.round(progress * 2),
    total_deleted_lines: Math.round(progress),
    file_changes: fileChanges,
    last_change: new Date().toISOString(),
  };
}

/**
 * 生成Mock产物
 * 根据进度逐步显示不同产物
 */
function generateMockArtifacts(progress: number) {
  const artifacts = [];

  if (progress > 20) {
    artifacts.push({
      id: "artifact-1",
      type: "text" as const,
      title: "代码审查报告",
      content:
        "## 代码审查结果\n\n发现3个潜在问题：\n1. 组件状态管理可优化\n2. 部分props缺少类型定义\n3. 建议添加错误边界处理",
      created_at: new Date().toISOString(),
    });
  }

  if (progress > 50) {
    artifacts.push({
      id: "artifact-2",
      type: "code_diff" as const,
      title: "重构后的ChatContainer组件",
      content:
        "```typescript\nexport function ChatContainer() {\n  // 优化后的代码\n  const [session, setSession] = useState();\n  \n  useEffect(() => {\n    fetchSession();\n  }, []);\n}",
      created_at: new Date().toISOString(),
      metadata: { language: "typescript" },
    });
  }

  if (progress > 80) {
    artifacts.push({
      id: "artifact-3",
      type: "markdown" as const,
      title: "API集成文档",
      content:
        "# API集成说明\n\n## 创建会话\n\nPOST /api/v1/sessions\n\n## 获取会话状态\n\nGET /api/v1/sessions/{id}",
      created_at: new Date().toISOString(),
    });
  }

  return artifacts;
}

/**
 * 生成Mock技能使用记录
 */
function generateMockSkills(progress: number) {
  const skills = [
    {
      id: "skill-1",
      name: "Code Analysis",
      description: "分析代码结构和依赖关系",
      status: "completed" as const,
      duration: 1250,
      created_at: new Date(Date.now() - 5000).toISOString(),
    },
    {
      id: "skill-2",
      name: "File Generation",
      description: "生成组件代码",
      status: (progress > 50 ? "completed" : "running") as
        | "completed"
        | "running",
      duration: progress > 50 ? 2100 : undefined,
      created_at: new Date(Date.now() - 3000).toISOString(),
    },
  ];

  return skills;
}

/**
 * 生成当前步骤描述
 */
function generateMockCurrentStep(progress: number): string {
  if (progress < 30) return "正在分析代码结构...";
  if (progress < 60) return "正在实现核心组件...";
  if (progress < 90) return "正在集成API接口...";
  return "正在执行最终检查...";
}

// ============ 以下为原有函数，用于demo演示 ============

/**
 * Create a mock execution session for demo
 */
export function createMockExecutionSession(): ExecutionSession {
  return {
    session_id: "demo-session-001",
    time: new Date().toISOString(),
    status: "running",
    progress: 48,
    task_name: "重构前端代码并优化性能",
    new_message: {
      title: "AI Task Execution",
    },
    state_patch: {
      current_step: "正在生成产物中...",
      todos: [
        {
          content: "读取并分析项目结构",
          status: "completed",
          active_form: null,
        },
        {
          content: "识别需要重构的组件",
          status: "completed",
          active_form: null,
        },
        {
          content: "生成重构方案",
          status: "completed",
          active_form: null,
        },
        {
          content: "应用代码更改",
          status: "in_progress",
          active_form: "正在应用代码更改...",
        },
        {
          content: "生成文档说明",
          status: "pending",
          active_form: null,
        },
        {
          content: "运行测试验证",
          status: "pending",
          active_form: null,
        },
      ],
      skills_used: [
        {
          id: "skill-1",
          name: "Code Analysis",
          description: "分析代码结构和依赖关系",
          status: "completed",
          duration: 2340,
          created_at: new Date(Date.now() - 10000).toISOString(),
        },
        {
          id: "skill-2",
          name: "Refactoring",
          description: "重构组件并优化性能",
          status: "running",
          duration: undefined,
          created_at: new Date(Date.now() - 5000).toISOString(),
        },
        {
          id: "skill-3",
          name: "Documentation",
          description: "生成技术文档和注释",
          status: "pending",
          duration: undefined,
          created_at: new Date().toISOString(),
        },
      ],
      mcp_status: [
        {
          server_name: "github",
          status: "connected",
          message: "Successfully authenticated",
        },
        {
          server_name: "filesystem",
          status: "connected",
          message: "Workspace mounted",
        },
        {
          server_name: "database",
          status: "disconnected",
          message: "Connection timeout",
        },
        {
          server_name: "docker",
          status: "connected",
          message: "Container running",
        },
      ],
      artifacts: [
        {
          id: "artifact-1",
          type: "code_diff",
          title: "UserProfile 组件重构",
          content: `@@ -1,25 +1,58 @@
 import React from 'react';
-import { User } from './types';
+import { User, UserProfileProps } from './types';
+import { Avatar } from './ui/avatar';
+import { Button } from './ui/button';

-export function UserProfile({ user }: { user: User }) {
-  return (
-    <div className="user-profile">
-      <h2>{user.name}</h2>
-      <p>{user.email}</p>
-    </div>
-  );
+export function UserProfile({ user, onEdit }: UserProfileProps) {
+  const [isEditing, setIsEditing] = React.useState(false);
+
+  const handleSave = () => {
+    setIsEditing(false);
+    onEdit?.(user);
+  };
+
+  return (
+    <div className="flex items-center gap-4 p-4 border rounded-lg">
+      <Avatar src={user.avatar} size="lg" />
+      <div className="flex-1">
+        <h3 className="font-semibold text-lg">{user.name}</h3>
+        <p className="text-sm text-muted-foreground">{user.email}</p>
+        <p className="text-xs text-muted-foreground mt-1">
+          Role: {user.role}
+        </p>
+      </div>
+      <Button
+        onClick={() => setIsEditing(!isEditing)}
+        variant="outline"
+      >
+        {isEditing ? 'Cancel' : 'Edit'}
+      </Button>
+      {isEditing && (
+        <Button onClick={handleSave} className="ml-2">
+          Save
+        </Button>
+      )}
+    </div>
+  );
 }`,
          metadata: {
            language: "TypeScript",
          },
          created_at: new Date().toISOString(),
        },
        {
          id: "artifact-2",
          type: "markdown",
          title: "重构方案说明文档",
          content: `# 前端重构方案

## 目标
优化前端代码性能，提升用户体验

## 主要变更

### 1. 组件重构
- 重构 UserProfile 组件，添加编辑功能
- 优化状态管理，减少不必要的重渲染

### 2. 性能优化
- 使用 React.memo 优化组件渲染
- 实现虚拟滚动处理长列表
- 懒加载图片和组件

### 3. 代码质量
- 添加 TypeScript 类型定义
- 改善错误处理
- 增加单元测试覆盖率

## 预期效果
- 首屏加载时间减少 40%
- 交互响应速度提升 30%
- 代码可维护性提升`,
          created_at: new Date().toISOString(),
        },
        {
          id: "artifact-3",
          type: "image",
          title: "性能对比图表",
          url: "https://placehold.co/600x400/e2e8f0/64748b?text=Performance+Comparison",
          metadata: {
            size: 256000,
            format: "PNG",
          },
          created_at: new Date().toISOString(),
        },
        {
          id: "artifact-4",
          type: "text",
          title: "性能测试报告摘要",
          content: `测试日期: 2025-01-15
测试环境: Chrome 120, MacBook Pro M1

优化前：
- 首屏加载: 3.2s
- 交互响应: 180ms
- 内存占用: 45MB

优化后：
- 首屏加载: 1.9s (↓40%)
- 交互响应: 126ms (↓30%)
- 内存占用: 38MB (↓15%)

结论: 重构目标已达成，性能提升显著。`,
          created_at: new Date().toISOString(),
        },
        {
          id: "artifact-5",
          type: "ppt",
          title: "项目演示文稿",
          url: "/slides/demo.pptx",
          metadata: {
            size: 2048000,
            format: "PPTX",
          },
          created_at: new Date().toISOString(),
        },
      ],
      workspace_state: {
        repository: "github.com/user/my-project",
        branch: "feature/refactor-ui",
        total_added_lines: 156,
        total_deleted_lines: 89,
        last_change: new Date().toISOString(),
        file_changes: [],
      },
    },
  };
}

/**
 * Simulate progress update for demo
 */
export function simulateProgressUpdate(
  session: ExecutionSession,
): ExecutionSession {
  const newProgress = Math.min(session.progress + Math.random() * 5, 100);
  const todos = session.state_patch.todos || [];
  const updatedTodos = [...todos];

  // Update todo status based on progress
  if (newProgress > 30 && updatedTodos[3]?.status === "in_progress") {
    updatedTodos[3] = {
      ...updatedTodos[3]!,
      status: "completed" as const,
      active_form: null,
    };
  }
  if (newProgress > 50 && updatedTodos[4]?.status === "pending") {
    updatedTodos[4] = {
      ...updatedTodos[4]!,
      status: "in_progress" as const,
      active_form: "正在生成文档...",
    };
  }
  if (newProgress > 75 && updatedTodos[5]?.status === "pending") {
    updatedTodos[5] = {
      ...updatedTodos[5]!,
      status: "in_progress" as const,
      active_form: "正在运行测试...",
    };
  }
  if (newProgress >= 100) {
    updatedTodos.forEach((todo, i) => {
      if (todo.status !== "completed") {
        updatedTodos[i] = {
          ...todo,
          status: "completed" as const,
          active_form: null,
        };
      }
    });
  }

  // Update skill status
  const skills = session.state_patch.skills_used || [];
  const updatedSkills = [...skills];
  if (newProgress > 60 && updatedSkills[1]?.status === "running") {
    updatedSkills[1] = {
      ...updatedSkills[1]!,
      status: "completed" as const,
      duration: 5600,
    };
  }
  if (newProgress > 80 && updatedSkills[2]?.status === "pending") {
    updatedSkills[2] = {
      ...updatedSkills[2]!,
      status: "completed" as const,
      duration: 3200,
    };
  }

  return {
    ...session,
    progress: Math.round(newProgress),
    status: newProgress >= 100 ? "completed" : session.status,
    state_patch: {
      ...session.state_patch,
      todos: updatedTodos,
      skills_used: updatedSkills,
      current_step:
        newProgress >= 100 ? "任务完成！" : session.state_patch.current_step,
    },
  };
}
