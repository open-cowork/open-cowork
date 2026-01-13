"use client";

import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileChangesHeader } from "./file-changes-header";
import { FileChangesList } from "./file-changes-list";
import { useT } from "@/app/i18n/client";
import type { WorkspaceState } from "../../model/execution-types";

interface FileChangesPanelProps {
  workspaceState?: WorkspaceState;
}

export function FileChangesPanel({ workspaceState }: FileChangesPanelProps) {
  const { t } = useT("translation");

  if (!workspaceState) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-muted-foreground">
          <p className="text-sm">{t("fileChanges.noChanges")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-card shrink-0 min-h-[85px] flex flex-col justify-center">
        <FileChangesHeader workspaceState={workspaceState} />
      </div>

      {/* File changes list */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-4 py-4">
          <FileChangesList fileChanges={workspaceState.file_changes} />
        </div>
      </ScrollArea>
    </div>
  );
}
