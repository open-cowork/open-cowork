"use client";

import * as React from "react";
import { GitBranch, GitCommit, Plus, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useT } from "@/app/i18n/client";
import type { WorkspaceState } from "../../model/execution-types";

interface FileChangesHeaderProps {
  workspaceState: WorkspaceState;
}

export function FileChangesHeader({ workspaceState }: FileChangesHeaderProps) {
  const { t } = useT("translation");

  return (
    <div className="space-y-2">
      {/* Repository and branch info */}
      <div className="flex items-center gap-3 text-sm">
        {workspaceState.repository && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <GitCommit className="size-4" />
            <span className="font-mono text-xs">
              {workspaceState.repository}
            </span>
          </div>
        )}
        {workspaceState.branch && (
          <div className="flex items-center gap-1.5">
            <GitBranch className="size-4 text-muted-foreground" />
            <Badge variant="outline" className="font-mono text-xs">
              {workspaceState.branch}
            </Badge>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <Plus className="size-4 text-green-600 dark:text-green-400" />
          <span className="font-medium text-green-600 dark:text-green-400">
            +{workspaceState.total_added_lines}
          </span>
          <span className="text-muted-foreground">
            {t("fileChanges.lines")}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Minus className="size-4 text-red-600 dark:text-red-400" />
          <span className="font-medium text-red-600 dark:text-red-400">
            -{workspaceState.total_deleted_lines}
          </span>
          <span className="text-muted-foreground">
            {t("fileChanges.lines")}
          </span>
        </div>
        <div className="text-muted-foreground">
          {workspaceState.file_changes.length} {t("fileChanges.files")}
        </div>
      </div>
    </div>
  );
}
