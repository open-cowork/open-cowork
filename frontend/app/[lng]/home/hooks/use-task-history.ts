"use client";

import * as React from "react";

import type { TaskHistoryItem, TaskStatus } from "../model/types";

type AddTaskOptions = {
  status?: TaskStatus;
  timestamp?: string;
  projectId?: string | null;
};

const MAX_TASK_TITLE_LEN = 50;

export function useTaskHistory(getInitialTasks: () => TaskHistoryItem[]) {
  const [taskHistory, setTaskHistory] =
    React.useState<TaskHistoryItem[]>(getInitialTasks);

  const addTask = React.useCallback(
    (rawTitle: string, options: AddTaskOptions = {}) => {
      const title = rawTitle.trim();
      if (!title) return null;

      const displayTitle =
        title.slice(0, MAX_TASK_TITLE_LEN) +
        (title.length > MAX_TASK_TITLE_LEN ? "..." : "");

      const newTask: TaskHistoryItem = {
        id: Date.now().toString(),
        title: displayTitle,
        status: options.status ?? "pending",
        timestamp: options.timestamp,
        projectId: options.projectId,
      };

      setTaskHistory((prev) => [newTask, ...prev]);
      return newTask;
    },
    [],
  );

  const removeTask = React.useCallback((taskId: string) => {
    setTaskHistory((prev) => prev.filter((task) => task.id !== taskId));
  }, []);

  const moveTask = React.useCallback(
    (taskId: string, projectId: string | null) => {
      setTaskHistory((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, projectId } : task,
        ),
      );
    },
    [],
  );

  return { taskHistory, addTask, removeTask, moveTask };
}
