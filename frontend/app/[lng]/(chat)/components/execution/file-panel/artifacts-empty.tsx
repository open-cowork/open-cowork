import { File } from "lucide-react";

/**
 * Empty state component for artifacts panel
 */
export function ArtifactsEmpty() {
  return (
    <div className="flex items-center justify-center flex-1">
      <div className="text-center text-muted-foreground">
        <File className="size-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">暂无文件变更</p>
        <p className="text-xs mt-1">AI 执行产生的文件变更将在此处展示</p>
      </div>
    </div>
  );
}
