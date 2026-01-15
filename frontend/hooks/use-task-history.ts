import { useState, useCallback, useEffect } from "react";
import { tasksApi } from "@/lib/api/projects"; // Using same file for now as they are closely related in mocks
import type { TaskHistoryItem } from "@/lib/api-types";

export function useTaskHistory() {
  const [taskHistory, setTaskHistory] = useState<TaskHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load persistence logic
  const STORAGE_KEY = "opencowork_task_history";

  const fetchTasks = useCallback(async () => {
    try {
      // 1. Try to load from localStorage first for "state"
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setTaskHistory(JSON.parse(saved));
      } else {
        // 2. If nothing in storage, use API mocks
        const data = await tasksApi.listHistory();
        setTaskHistory(data);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
    } catch (error) {
      console.error("Failed to fetch task history", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Sync state to localStorage whenever it changes
  const updateTasks = useCallback(
    (setter: (prev: TaskHistoryItem[]) => TaskHistoryItem[]) => {
      setTaskHistory((prev) => {
        const next = setter(prev);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  const addTask = useCallback(
    (
      title: string,
      options?: {
        timestamp?: string;
        status?: TaskHistoryItem["status"];
        projectId?: string;
        id?: string;
      },
    ) => {
      const newTask: TaskHistoryItem = {
        id: options?.id || `task-${Date.now()}`,
        title,
        timestamp: options?.timestamp || "Just now",
        status: options?.status || "pending",
        projectId: options?.projectId,
      };
      updateTasks((prev) => [newTask, ...prev]);
      return newTask;
    },
    [updateTasks],
  );

  const removeTask = useCallback(
    (taskId: string) => {
      updateTasks((prev) => prev.filter((task) => task.id !== taskId));
    },
    [updateTasks],
  );

  const moveTask = useCallback(
    (taskId: string, projectId: string | null) => {
      updateTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? { ...task, projectId: projectId ?? undefined }
            : task,
        ),
      );
    },
    [updateTasks],
  );

  return {
    taskHistory,
    isLoading,
    addTask,
    removeTask,
    moveTask,
  };
}
