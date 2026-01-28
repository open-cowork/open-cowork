"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { useT } from "@/lib/i18n/client";

import { useAutosizeTextarea } from "../hooks/use-autosize-textarea";

import { HomeHeader } from "./home-header";
import { TaskComposer } from "./task-composer";
import { ConnectorsBar } from "./connectors-bar";
import { createSessionAction } from "@/features/chat/actions/session-actions";
import type { ComposerMode, TaskSendOptions } from "./task-composer";

import { useAppShell } from "@/components/shared/app-shell-context";
import { scheduledTasksService } from "@/features/scheduled-tasks/services/scheduled-tasks-service";
import { toast } from "sonner";
import type { TaskConfig } from "@/features/chat/types/api/session";

export function HomePageClient() {
  const { t } = useT("translation");
  const router = useRouter();
  const { lng, addTask, openSettings } = useAppShell();

  const [inputValue, setInputValue] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isInputFocused, setIsInputFocused] = React.useState(false);
  const [mode, setMode] = React.useState<ComposerMode>("task");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  useAutosizeTextarea(textareaRef, inputValue);

  // Determine if connectors bar should be expanded
  const shouldExpandConnectors = isInputFocused || inputValue.trim().length > 0;

  const handleSendTask = React.useCallback(
    async (options?: TaskSendOptions) => {
      const inputFiles = options?.attachments ?? [];
      const repoUrl = (options?.repo_url || "").trim();
      const gitBranch = (options?.git_branch || "").trim() || "main";
      const scheduledTask = options?.scheduled_task ?? null;
      if (
        (mode === "scheduled"
          ? inputValue.trim() === ""
          : inputValue.trim() === "" && inputFiles.length === 0) ||
        isSubmitting
      ) {
        return;
      }

      setIsSubmitting(true);
      console.log("[Home] Sending task:", inputValue, { mode });

      try {
        // Build config object (shared by plan/task, and also used to pin scheduled task config)
        const config: TaskConfig & Record<string, unknown> = {};
        if (inputFiles.length > 0) {
          config.input_files = inputFiles;
        }
        if (repoUrl) {
          config.repo_url = repoUrl;
          config.git_branch = gitBranch;
        }

        if (mode === "scheduled") {
          const name =
            (scheduledTask?.name || "").trim() ||
            inputValue.trim().slice(0, 32);
          const cron = (scheduledTask?.cron || "").trim() || "*/5 * * * *";
          const timezone = (scheduledTask?.timezone || "").trim() || "UTC";
          const enabled = Boolean(scheduledTask?.enabled ?? true);
          const reuseSession = Boolean(scheduledTask?.reuse_session ?? true);

          await scheduledTasksService.create({
            name,
            cron,
            timezone,
            prompt: inputValue,
            enabled,
            reuse_session: reuseSession,
            config: Object.keys(config).length > 0 ? config : undefined,
          });

          toast.success(t("library.scheduledTasks.toasts.created"));
          setInputValue("");
          // Navigate to manage page after creation
          router.push(`/${lng}/capabilities/scheduled-tasks`);
          return;
        }

        const finalPrompt =
          mode === "plan"
            ? t("hero.modes.planPrefix", { prompt: inputValue })
            : inputValue;

        // 1. Call create session API
        const session = await createSessionAction({
          prompt: finalPrompt,
          config: Object.keys(config).length > 0 ? config : undefined,
        });
        console.log("session", session);
        const sessionId = session.sessionId;
        console.log("sessionId", sessionId);

        // 2. Save prompt to localStorage for compatibility/fallback
        localStorage.setItem(`session_prompt_${sessionId}`, inputValue);

        // 3. Add to local history (persisted via localStorage in hook)
        addTask(inputValue, {
          id: sessionId,
          timestamp: new Date().toISOString(),
          status: "running",
        });

        console.log("[Home] Navigating to chat session:", sessionId);
        setInputValue("");

        // 4. Navigate to the chat page
        router.push(`/${lng}/chat/${sessionId}`);
      } catch (error) {
        console.error("[Home] Failed to create session:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [addTask, inputValue, isSubmitting, lng, mode, router, t],
  );

  return (
    <>
      <HomeHeader onOpenSettings={openSettings} />

      <div className="flex flex-1 flex-col items-center justify-start px-6 pt-[20vh]">
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
            mode={mode}
            onModeChange={setMode}
            onSend={handleSendTask}
            isSubmitting={isSubmitting}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
          />

          <ConnectorsBar
            forceExpanded={shouldExpandConnectors && mode !== "scheduled"}
          />
        </div>
      </div>
    </>
  );
}
