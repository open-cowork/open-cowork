"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";

import { useT } from "@/app/i18n/client";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { useAutosizeTextarea } from "../../home/hooks/use-autosize-textarea";
import { useTaskHistory } from "../../home/hooks/use-task-history";
import {
  createMockProjects,
  createMockTaskHistory,
} from "../../home/model/mocks";
import type { ProjectItem } from "../../home/model/types";

import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { ProjectHeader } from "./components/project-header";
import { KeyboardHints } from "../../home/components/keyboard-hints";
import { QuickActions } from "../../home/components/quick-actions";
import { TaskComposer } from "../../home/components/task-composer";

export default function ProjectPage() {
  const { t } = useT("translation");
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [projects] = React.useState<ProjectItem[]>(() => createMockProjects(t));
  const currentProject = React.useMemo(
    () => projects.find((p) => p.id === projectId) || projects[0],
    [projects, projectId],
  );

  // 获取所有任务（不只是当前项目的任务）
  const { taskHistory, addTask, removeTask } = useTaskHistory(() =>
    createMockTaskHistory(t),
  );

  const [inputValue, setInputValue] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  useAutosizeTextarea(textareaRef, inputValue);

  const focusComposer = React.useCallback(() => {
    requestAnimationFrame(() => textareaRef.current?.focus());
  }, []);

  const handleNewTask = React.useCallback(() => {
    // 跳转到新对话页面，并带上项目ID
    router.push(`/chat/new?projectId=${projectId}`);
  }, [router, projectId]);

  const handleSendTask = React.useCallback(() => {
    const created = addTask(inputValue, {
      timestamp: t("mocks.timestamps.justNow"),
      projectId, // 自动关联到当前项目
    });
    if (!created) return;

    setInputValue("");
  }, [addTask, inputValue, t, projectId]);

  const handleQuickActionPick = React.useCallback(
    (prompt: string) => {
      setInputValue(prompt);
      focusComposer();
    },
    [focusComposer],
  );

  const handleRenameTask = React.useCallback(
    (taskId: string, newName: string) => {
      // TODO: Implement task rename logic
      console.log("Rename task:", taskId, "to:", newName);
    },
    [],
  );

  const handleMoveTaskToProject = React.useCallback(
    (taskId: string, newProjectId: string | null) => {
      // TODO: Implement move task to project logic
      console.log("Move task:", taskId, "to project:", newProjectId);
    },
    [],
  );

  const handleCreateProject = React.useCallback((name: string) => {
    // TODO: Implement create project logic
    console.log("Create project:", name);
  }, []);

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-svh w-full overflow-hidden bg-background">
        <AppSidebar
          projects={projects}
          taskHistory={taskHistory}
          onNewTask={handleNewTask}
          onDeleteTask={removeTask}
          onRenameTask={handleRenameTask}
          onMoveTaskToProject={handleMoveTaskToProject}
          onCreateProject={handleCreateProject}
        />

        <SidebarInset className="flex flex-col bg-muted/30">
          <ProjectHeader project={currentProject} />

          <div className="flex flex-1 flex-col items-center justify-center px-6 py-10">
            <div className="w-full max-w-2xl">
              {/* 欢迎语 */}
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-medium tracking-tight text-foreground">
                  {currentProject?.name || t("hero.title")}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("project.subtitle", {
                    count: taskHistory.filter((t) => t.projectId === projectId)
                      .length,
                  })}
                </p>
              </div>

              <TaskComposer
                textareaRef={textareaRef}
                value={inputValue}
                onChange={setInputValue}
                onSend={handleSendTask}
              />

              <QuickActions onPick={handleQuickActionPick} />
              <KeyboardHints />
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
