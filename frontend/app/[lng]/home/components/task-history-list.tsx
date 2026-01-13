"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";

import { useT } from "@/app/i18n/client";
import { cn } from "@/lib/utils";
import {
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { TASK_STATUS_META } from "../model/constants";
import type { TaskHistoryItem } from "../model/types";

export function TaskHistoryList({
  tasks,
  onDeleteTask,
}: {
  tasks: TaskHistoryItem[];
  onDeleteTask: (taskId: string) => void;
}) {
  const { t } = useT("translation");

  return (
    <SidebarMenu className="gap-0.5">
      {tasks.map((task) => {
        const statusMeta = TASK_STATUS_META[task.status];

        return (
          <SidebarMenuItem key={task.id}>
            <SidebarMenuButton
              className="group relative h-auto w-full justify-start gap-3 rounded-lg py-2 pr-8 text-left hover:bg-sidebar-accent group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:pr-0"
              tooltip={task.title}
            >
              <span
                className={cn(
                  "size-2 shrink-0 rounded-full group-data-[collapsible=icon]:mt-0",
                  statusMeta.dotClassName,
                )}
                aria-hidden="true"
              />
              <span className="sr-only">{t(statusMeta.labelKey)}</span>
              <span className="flex-1 truncate text-sm group-data-[collapsible=icon]:hidden">
                {task.title}
              </span>
            </SidebarMenuButton>
            <SidebarMenuAction
              showOnHover={true}
              onClick={(e) => {
                e.stopPropagation();
                onDeleteTask(task.id);
              }}
              className="right-1 group-data-[collapsible=icon]:hidden"
            >
              <Trash2 className="size-3.5" />
            </SidebarMenuAction>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
