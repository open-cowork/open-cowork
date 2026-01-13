"use client";

import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Activity } from "lucide-react";
import { TodoList } from "./todo-list";
import { McpStatusCard } from "./mcp-status-card";
import { SkillUsageCard } from "./skill-usage-card";
import type { StatePatch } from "../../model/execution-types";

interface StatusPanelProps {
  statePatch?: StatePatch;
  progress?: number;
  currentStep?: string;
}

export function StatusPanel({
  statePatch,
  progress = 0,
  currentStep,
}: StatusPanelProps) {
  const hasSkills =
    statePatch?.skills_used && statePatch.skills_used.length > 0;
  const hasMcp = statePatch?.mcp_status && statePatch.mcp_status.length > 0;
  const hasTodos = statePatch?.todos && statePatch.todos.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header with icon */}
      <div className="px-6 py-4 border-b border-border bg-card shrink-0 min-h-[85px] flex flex-col justify-center">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 shrink-0">
            <Activity className="size-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold text-foreground">
              执行状态
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              任务进度、技能使用、MCP服务器状态
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable content area with two cards */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-4 py-4 space-y-4 h-full flex flex-col">
          {/* Todo List Card with progress */}
          {hasTodos && (
            <div className="flex-1 min-h-0">
              <TodoList
                todos={statePatch.todos!}
                progress={progress}
                currentStep={currentStep}
              />
            </div>
          )}

          {/* Separator if both cards exist */}
          {hasTodos && (hasSkills || hasMcp) && <Separator className="my-4" />}

          {/* Skill Usage & MCP Status in one card or separate */}
          {(hasSkills || hasMcp) && (
            <div className="flex-1 min-h-0 flex flex-col gap-4">
              {hasSkills && <SkillUsageCard skills={statePatch.skills_used!} />}
              {hasMcp && <McpStatusCard mcpStatuses={statePatch.mcp_status!} />}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
