"use client";

import * as React from "react";
import type {
  SearchResultTask,
  SearchResultProject,
  SearchResultMessage,
} from "@/lib/api-types";

/**
 * Hook for fetching and aggregating search data
 * Currently uses mock data - will be replaced with API calls later
 */
export function useSearchData() {
  const [tasks, setTasks] = React.useState<SearchResultTask[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  // Mock data fetch - simulates API delay
  const fetchData = React.useCallback(async () => {
    try {
      setIsLoading(true);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Mock task data
      const mockTasks: SearchResultTask[] = [
        {
          id: "1",
          title: "帮我重构前端的代码",
          status: "completed",
          timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          type: "task",
        },
        {
          id: "2",
          title: "研究一下 claude code",
          status: "running",
          timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          type: "task",
        },
        {
          id: "3",
          title: "创建一个新的 React 组件",
          status: "pending",
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          type: "task",
        },
      ];

      setTasks(mockTasks);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch search data:", err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial data fetch
  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Mock projects - TODO: Fetch from backend when project API is available
  const projects = React.useMemo<SearchResultProject[]>(
    () => [
      {
        id: "p-1",
        name: "新项目",
        taskCount: 2,
        type: "project",
      },
    ],
    [],
  );

  // Mock messages - TODO: Fetch from backend when needed
  const messages = React.useMemo<SearchResultMessage[]>(() => [], []);

  return {
    tasks,
    projects,
    messages,
    isLoading,
    error,
    refetch: fetchData,
  };
}
