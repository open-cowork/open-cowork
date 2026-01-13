"use client";

import * as React from "react";

import { useT } from "@/app/i18n/client";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { useAutosizeTextarea } from "../hooks/use-autosize-textarea";
import { useTaskHistory } from "../hooks/use-task-history";
import { createMockProjects, createMockTaskHistory } from "../model/mocks";
import type { ProjectItem } from "../model/types";

import { HomeHeader } from "./home-header";
import { HomeSidebar } from "./home-sidebar";
import { KeyboardHints } from "./keyboard-hints";
import { QuickActions } from "./quick-actions";
import { TaskComposer } from "./task-composer";

export function HomePage() {
  const { t } = useT("translation");

  const [projects] = React.useState<ProjectItem[]>(() => createMockProjects(t));
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
    setInputValue("");
    focusComposer();
  }, [focusComposer]);

  const handleSendTask = React.useCallback(() => {
    const created = addTask(inputValue, {
      timestamp: t("mocks.timestamps.justNow"),
    });
    if (!created) return;

    setInputValue("");
  }, [addTask, inputValue, t]);

  const handleQuickActionPick = React.useCallback(
    (prompt: string) => {
      setInputValue(prompt);
      focusComposer();
    },
    [focusComposer],
  );

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-svh w-full overflow-hidden bg-background">
        <HomeSidebar
          projects={projects}
          taskHistory={taskHistory}
          onNewTask={handleNewTask}
          onDeleteTask={removeTask}
        />

        <SidebarInset className="flex flex-col bg-muted/30">
          <HomeHeader />

          <div className="flex flex-1 flex-col items-center justify-center px-6 py-10">
            <div className="w-full max-w-2xl">
              {/* 欢迎语 */}
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-medium tracking-tight text-foreground">
                  {t("hero.title")}
                </h1>
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
