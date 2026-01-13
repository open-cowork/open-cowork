"use client";

import * as React from "react";
import { FileChangeItem } from "./file-change-item";
import type { FileChange } from "../../model/execution-types";

interface FileChangesListProps {
  fileChanges: FileChange[];
}

export function FileChangesList({ fileChanges }: FileChangesListProps) {
  if (fileChanges.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p className="text-sm">暂无文件更改</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {fileChanges.map((change, index) => (
        <FileChangeItem key={index} fileChange={change} />
      ))}
    </div>
  );
}
