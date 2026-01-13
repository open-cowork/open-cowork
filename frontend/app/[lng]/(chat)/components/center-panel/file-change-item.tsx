"use client";

import * as React from "react";
import {
  File,
  DiffIcon,
  Plus,
  Minus,
  FileEdit,
  Trash2,
  CornerUpRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useT } from "@/app/i18n/client";
import type { FileChange, FileChangeStatus } from "../../model/execution-types";

interface FileChangeItemProps {
  fileChange: FileChange;
}

export function FileChangeItem({ fileChange }: FileChangeItemProps) {
  const { t } = useT("translation");
  const [showDiff, setShowDiff] = React.useState(false);

  const getStatusConfig = (status: FileChangeStatus) => {
    switch (status) {
      case "added":
        return {
          icon: Plus,
          label: t("fileChanges.added"),
          className: "text-green-600 dark:text-green-400 bg-green-600/10",
        };
      case "deleted":
        return {
          icon: Trash2,
          label: t("fileChanges.deleted"),
          className: "text-red-600 dark:text-red-400 bg-red-600/10",
        };
      case "renamed":
        return {
          icon: CornerUpRight,
          label: t("fileChanges.renamed"),
          className: "text-blue-600 dark:text-blue-400 bg-blue-600/10",
        };
      default:
        return {
          icon: FileEdit,
          label: t("fileChanges.modified"),
          className: "text-orange-600 dark:text-orange-400 bg-orange-600/10",
        };
    }
  };

  const statusConfig = getStatusConfig(fileChange.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* File info */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <File className="size-4 text-muted-foreground flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-mono truncate">{fileChange.path}</p>
            {fileChange.old_path && (
              <p className="text-xs text-muted-foreground font-mono truncate">
                {fileChange.old_path} → {fileChange.path}
              </p>
            )}
          </div>
        </div>
        <Badge
          className={cn("text-xs", statusConfig.className)}
          variant="outline"
        >
          <StatusIcon className="size-3 mr-1" />
          {statusConfig.label}
        </Badge>
      </div>

      {/* Statistics */}
      {(fileChange.added_lines > 0 || fileChange.deleted_lines > 0) && (
        <div className="flex items-center gap-3 px-3 py-1.5 bg-muted/30 text-xs">
          {fileChange.added_lines > 0 && (
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <Plus className="size-3" />
              <span>+{fileChange.added_lines}</span>
            </div>
          )}
          {fileChange.deleted_lines > 0 && (
            <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
              <Minus className="size-3" />
              <span>-{fileChange.deleted_lines}</span>
            </div>
          )}
        </div>
      )}

      {/* Diff expand button */}
      {fileChange.diff && (
        <div className="px-3 py-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDiff(!showDiff)}
            className="w-full justify-start text-xs"
          >
            <DiffIcon className="size-3 mr-2" />
            {showDiff ? t("fileChanges.hideDiff") : t("fileChanges.showDiff")}
          </Button>
        </div>
      )}

      {/* Diff content */}
      {showDiff && fileChange.diff && (
        <div className="px-3 py-2 border-t border-border bg-muted/30">
          <pre className="text-xs font-mono overflow-x-auto whitespace-pre-wrap">
            {fileChange.diff}
          </pre>
        </div>
      )}
    </div>
  );
}
