"use client";

import * as React from "react";

/**
 * Manages the batch selection state for sidebar tasks and projects.
 *
 * Encapsulates:
 * - Selection mode toggle
 * - Task and project selection sets
 * - Keyboard shortcut (Escape to cancel)
 * - Batch delete orchestration
 */
export function useSidebarSelection(handlers: {
  onDeleteTask: (taskId: string) => Promise<void> | void;
  onDeleteProject?: (projectId: string) => Promise<void> | void;
}) {
  const [isSelectionMode, setIsSelectionMode] = React.useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = React.useState<Set<string>>(
    new Set(),
  );
  const [selectedProjectIds, setSelectedProjectIds] = React.useState<
    Set<string>
  >(new Set());

  // ---- Task selection ----

  const enableTaskSelectionMode = React.useCallback((taskId: string) => {
    setIsSelectionMode(true);
    setSelectedTaskIds(new Set([taskId]));
    setSelectedProjectIds(new Set());
  }, []);

  const toggleTaskSelection = React.useCallback((taskId: string) => {
    setSelectedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  }, []);

  // ---- Project selection ----

  const enableProjectSelectionMode = React.useCallback((projectId: string) => {
    setIsSelectionMode(true);
    setSelectedProjectIds(new Set([projectId]));
    setSelectedTaskIds(new Set());
  }, []);

  const toggleProjectSelection = React.useCallback((projectId: string) => {
    setSelectedProjectIds((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      return next;
    });
  }, []);

  // ---- Cancel ----

  const cancelSelectionMode = React.useCallback(() => {
    setIsSelectionMode(false);
    setSelectedTaskIds(new Set());
    setSelectedProjectIds(new Set());
  }, []);

  // Escape key handler
  React.useEffect(() => {
    if (!isSelectionMode) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") cancelSelectionMode();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSelectionMode, cancelSelectionMode]);

  // ---- Batch delete ----

  const deleteSelectedItems = React.useCallback(async () => {
    await Promise.all(
      Array.from(selectedTaskIds).map((taskId) =>
        Promise.resolve(handlers.onDeleteTask(taskId)),
      ),
    );

    if (handlers.onDeleteProject) {
      for (const projectId of selectedProjectIds) {
        await handlers.onDeleteProject(projectId);
      }
    }

    cancelSelectionMode();
  }, [
    selectedTaskIds,
    selectedProjectIds,
    handlers,
    cancelSelectionMode,
  ]);

  const selectedCount = selectedTaskIds.size + selectedProjectIds.size;

  return {
    isSelectionMode,
    selectedTaskIds,
    selectedProjectIds,
    selectedCount,
    enableTaskSelectionMode,
    toggleTaskSelection,
    enableProjectSelectionMode,
    toggleProjectSelection,
    cancelSelectionMode,
    deleteSelectedItems,
  };
}
