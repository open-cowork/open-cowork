import { Github, X } from "lucide-react";
import { cn } from "@/lib/utils";

function deriveRepoLabel(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  try {
    const parsed = new URL(trimmed);
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length >= 2) {
      const owner = parts[0];
      let repo = parts[1];
      if (repo.endsWith(".git")) repo = repo.slice(0, -4);
      if (owner && repo) return `${owner}/${repo}`;
    }
    return parsed.hostname || trimmed;
  } catch {
    return trimmed;
  }
}

export interface RepoCardProps {
  url: string;
  branch?: string | null;
  className?: string;
  onOpen?: () => void;
  onRemove?: () => void;
  showRemove?: boolean;
}

export function RepoCard({
  url,
  branch,
  className,
  onOpen,
  onRemove,
  showRemove = Boolean(onRemove),
}: RepoCardProps) {
  const trimmedUrl = url.trim();
  const trimmedBranch = (branch || "").trim();
  const label = deriveRepoLabel(trimmedUrl) || trimmedUrl;
  const subtitle = trimmedBranch
    ? `${trimmedUrl} @${trimmedBranch}`
    : trimmedUrl;
  const isClickable = Boolean(onOpen);

  return (
    <div
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={isClickable ? onOpen : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onOpen?.();
              }
            }
          : undefined
      }
      className={cn(
        "group relative flex items-center gap-2 rounded-lg border border-border bg-card p-2 text-sm shadow-sm transition-all hover:shadow-md",
        isClickable ? "cursor-pointer" : "",
        className,
      )}
      title={subtitle}
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Github className="size-4" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <p className="truncate font-medium text-foreground" title={label}>
          {label}
        </p>
        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
      </div>

      {showRemove && onRemove ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute -right-2 -top-2 hidden size-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm transition-opacity group-hover:flex hover:bg-destructive/90"
          type="button"
        >
          <X className="size-3" />
        </button>
      ) : null}
    </div>
  );
}
