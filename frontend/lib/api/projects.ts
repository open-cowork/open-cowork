/**
 * Projects and Tasks API
 */

import type { ProjectItem, TaskHistoryItem } from "../api-types";

export const projectsApi = {
  list: async (): Promise<ProjectItem[]> => {
    // TODO: Replace with real API call
    // Return empty array for now
    return [];
  },

  create: async (name: string): Promise<ProjectItem> => {
    // TODO: Replace with real API call
    return {
      id: `project-${Date.now()}`,
      name,
      taskCount: 0,
      icon: "📁",
    };
  },
};

export const tasksApi = {
  listHistory: async (): Promise<TaskHistoryItem[]> => {
    // TODO: Replace with real API call
    // Return empty array for now
    return [];
  },
};
