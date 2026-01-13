import type { TFunction } from "i18next";

import type { ProjectItem, TaskHistoryItem } from "./types";

export function createMockProjects(t: TFunction): ProjectItem[] {
  return [{ id: "p-1", name: t("mocks.projects.newProject") }];
}

export function createMockTaskHistory(t: TFunction): TaskHistoryItem[] {
  return [
    {
      id: "1",
      title: t("mocks.taskHistory.refactorFrontend"),
      status: "completed",
      timestamp: t("mocks.timestamps.twoMinutesAgo"),
    },
    {
      id: "2",
      title: t("mocks.taskHistory.researchClaude"),
      status: "running",
      timestamp: t("mocks.timestamps.oneHourAgo"),
    },
  ];
}
