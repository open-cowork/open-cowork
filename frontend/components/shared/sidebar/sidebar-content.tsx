"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronRight, Plus } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useDroppable } from "@dnd-kit/core";

import { useT } from "@/lib/i18n/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  useSidebar,
} from "@/components/ui/sidebar";

import type { ProjectItem, TaskHistoryItem } from "@/features/projects/types";
import { TaskHistoryList } from "./task-history-list";
import { CollapsibleProjectItem } from "./collapsible-project-item";

// ---------------------------------------------------------------------------
// Droppable "All Tasks" group
// ---------------------------------------------------------------------------

interface DroppableAllTasksGroupProps {
  title: string;
  tasks: TaskHistoryItem[];
  onDeleteTask: (taskId: string) => Promise<void> | void;
  onRenameTask?: (taskId: string, newName: string) => Promise<void> | void;
  onMoveTaskToProject?: (taskId: string, projectId: string | null) => void;
  projects: ProjectItem[];
  isSelectionMode?: boolean;
  selectedTaskIds?: Set<string>;
  onToggleTaskSelection?: (taskId: string) => void;
  onEnableSelectionMode?: (taskId: string) => void;
  onTaskNavigate?: () => void;
}

function DroppableAllTasksGroup({
  title,
  tasks,
  onDeleteTask,
  onRenameTask,
  onMoveTaskToProject,
  projects,
  isSelectionMode,
  selectedTaskIds,
  onToggleTaskSelection,
  onEnableSelectionMode,
  onTaskNavigate,
}: DroppableAllTasksGroupProps) {
  const { t } = useT("translation");
  const { setNodeRef, isOver } = useDroppable({
    id: "all-tasks",
    data: { type: "all-tasks" },
  });

  return (
    <Collapsible defaultOpen className="group/collapsible-tasks flex flex-col">
      <SidebarGroup
        ref={setNodeRef}
        className={cn(
          "p-0 flex flex-col transition-colors rounded-lg overflow-hidden",
          isOver && "bg-primary/10",
        )}
      >
        <div className="group/tasks-header relative flex items-center justify-between p-2 shrink-0">
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex flex-1 items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer">
              {title}
              <ChevronRight className="size-4 transition-transform duration-200 group-data-[state=open]/collapsible-tasks:rotate-90" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
        </div>
        <CollapsibleContent>
          <SidebarGroupContent className="p-2 pt-0 mt-0 group-data-[collapsible=icon]:mt-0">
            <TaskHistoryList
              tasks={tasks}
              onDeleteTask={onDeleteTask}
              onRenameTask={onRenameTask}
              onMoveTaskToProject={onMoveTaskToProject}
              projects={projects}
              isSelectionMode={isSelectionMode}
              selectedTaskIds={selectedTaskIds}
              onToggleTaskSelection={onToggleTaskSelection}
              onEnableSelectionMode={onEnableSelectionMode}
              onNavigate={onTaskNavigate}
            />
            {isOver && (
              <div className="flex items-center justify-center p-2 text-xs text-primary bg-primary/5 rounded border border-dashed border-primary/20 mt-1">
                {t("sidebar.removeFromProject")}
              </div>
            )}
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}

// ---------------------------------------------------------------------------
// Main content section
// ---------------------------------------------------------------------------

interface SidebarContentSectionProps {
  projects: ProjectItem[];
  taskHistory: TaskHistoryItem[];
  onDeleteTask: (taskId: string) => Promise<void> | void;
  onRenameTask?: (taskId: string, newName: string) => Promise<void> | void;
  onMoveTaskToProject?: (taskId: string, projectId: string | null) => void;
  onRenameProject?: (projectId: string, newName: string) => void;
  onDeleteProject?: (projectId: string) => Promise<void> | void;
  onOpenCreateProjectDialog?: () => void;
  // Selection state (from useSidebarSelection)
  isSelectionMode: boolean;
  selectedTaskIds: Set<string>;
  selectedProjectIds: Set<string>;
  onToggleTaskSelection: (taskId: string) => void;
  onEnableTaskSelectionMode: (taskId: string) => void;
  onToggleProjectSelection: (projectId: string) => void;
  onEnableProjectSelectionMode: (projectId: string) => void;
}

export function SidebarContentSection({
  projects,
  taskHistory,
  onDeleteTask,
  onRenameTask,
  onMoveTaskToProject,
  onRenameProject,
  onDeleteProject,
  onOpenCreateProjectDialog,
  isSelectionMode,
  selectedTaskIds,
  selectedProjectIds,
  onToggleTaskSelection,
  onEnableTaskSelectionMode,
  onToggleProjectSelection,
  onEnableProjectSelectionMode,
}: SidebarContentSectionProps) {
  const { t } = useT("translation");
  const router = useRouter();
  const params = useParams();
  const { isMobile, setOpenMobile } = useSidebar();

  const lng = React.useMemo(() => {
    const value = params?.lng;
    if (!value) return undefined;
    return Array.isArray(value) ? value[0] : value;
  }, [params]);

  // Track scroll state for border
  const [isContentScrolled, setIsContentScrolled] = React.useState(false);
  const handleContentScroll = React.useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      setIsContentScrolled(event.currentTarget.scrollTop > 0);
    },
    [],
  );

  // Project expand/collapse state
  const [expandedProjects, setExpandedProjects] = React.useState<Set<string>>(
    new Set(),
  );

  // Auto-expand project when navigating to a session
  React.useEffect(() => {
    const activeTaskId = params?.id;
    if (activeTaskId && typeof activeTaskId === "string") {
      const activeTask = taskHistory.find((task) => task.id === activeTaskId);
      if (activeTask?.projectId) {
        setExpandedProjects((prev) => {
          if (!prev.has(activeTask.projectId!)) {
            const next = new Set(prev);
            next.add(activeTask.projectId!);
            return next;
          }
          return prev;
        });
      }
    }
  }, [params?.id, taskHistory]);

  const toggleProjectExpanded = React.useCallback((projectId: string) => {
    setExpandedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      return next;
    });
  }, []);

  // Derived data
  const unassignedTasks = React.useMemo(
    () => taskHistory.filter((task) => !task.projectId),
    [taskHistory],
  );

  const tasksByProject = React.useMemo(() => {
    const grouped = new Map<string, TaskHistoryItem[]>();
    taskHistory.forEach((task) => {
      if (task.projectId) {
        if (!grouped.has(task.projectId)) grouped.set(task.projectId, []);
        grouped.get(task.projectId)!.push(task);
      }
    });
    return grouped;
  }, [taskHistory]);

  const closeMobileSidebar = React.useCallback(() => {
    if (isMobile) setOpenMobile(false);
  }, [isMobile, setOpenMobile]);

  const handleProjectClick = React.useCallback(
    (projectId: string) => {
      router.push(
        lng ? `/${lng}/projects/${projectId}` : `/projects/${projectId}`,
      );
      closeMobileSidebar();
    },
    [router, lng, closeMobileSidebar],
  );

  const handleRenameProject = React.useCallback(
    (projectId: string, name: string) => {
      onRenameProject?.(projectId, name);
    },
    [onRenameProject],
  );

  return (
    <SidebarContent
      onScroll={handleContentScroll}
      className={cn(
        "border-t flex flex-col overflow-y-auto gap-0 transition-colors",
        isContentScrolled ? "border-border" : "border-transparent",
      )}
    >
      {/* Projects section */}
      <div className="flex flex-col">
        <Collapsible
          defaultOpen
          className="group/collapsible-projects flex flex-col"
        >
          <SidebarGroup className="p-0 flex flex-col group-data-[collapsible=icon]:hidden">
            <div className="group/projects-header relative flex items-center justify-between p-2 shrink-0">
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="flex flex-1 items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer">
                  {t("sidebar.projects")}
                  <ChevronRight className="size-4 transition-transform duration-200 group-data-[state=open]/collapsible-projects:rotate-90" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenCreateProjectDialog?.()}
                className="absolute right-2 top-1/2 -translate-y-1/2 size-6 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent opacity-0 group-hover/projects-header:opacity-100 transition-opacity"
                title={t("sidebar.newProject")}
              >
                <Plus className="size-4" />
              </Button>
            </div>
            <CollapsibleContent className="data-[state=closed]:flex-none">
              <SidebarGroupContent className="mt-1 group-data-[collapsible=icon]:mt-0 p-2 pt-0">
                <SidebarMenu>
                  {projects.map((project) => (
                    <CollapsibleProjectItem
                      key={project.id}
                      project={project}
                      tasks={tasksByProject.get(project.id) || []}
                      isExpanded={expandedProjects.has(project.id)}
                      onToggle={() => toggleProjectExpanded(project.id)}
                      onProjectClick={() => handleProjectClick(project.id)}
                      onDeleteTask={onDeleteTask}
                      onRenameTask={onRenameTask}
                      onMoveTaskToProject={onMoveTaskToProject}
                      allProjects={projects}
                      onRenameProject={handleRenameProject}
                      onDeleteProject={onDeleteProject}
                      isSelectionMode={isSelectionMode}
                      selectedTaskIds={selectedTaskIds}
                      selectedProjectIds={selectedProjectIds}
                      onToggleTaskSelection={onToggleTaskSelection}
                      onEnableSelectionMode={onEnableTaskSelectionMode}
                      onToggleProjectSelection={onToggleProjectSelection}
                      onEnableProjectSelectionMode={
                        onEnableProjectSelectionMode
                      }
                      onTaskNavigate={closeMobileSidebar}
                    />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </div>

      {/* Unassigned tasks section */}
      <div className="flex flex-col">
        <DroppableAllTasksGroup
          title={t("sidebar.allTasks")}
          tasks={unassignedTasks}
          onDeleteTask={onDeleteTask}
          onRenameTask={onRenameTask}
          onMoveTaskToProject={onMoveTaskToProject}
          projects={projects}
          isSelectionMode={isSelectionMode}
          selectedTaskIds={selectedTaskIds}
          onToggleTaskSelection={onToggleTaskSelection}
          onEnableSelectionMode={onEnableTaskSelectionMode}
          onTaskNavigate={closeMobileSidebar}
        />
      </div>
    </SidebarContent>
  );
}
