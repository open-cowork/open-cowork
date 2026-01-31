"use client";

import { Clock, Plus } from "lucide-react";

import { useT } from "@/lib/i18n/client";
import { Button } from "@/components/ui/button";

interface ScheduledTasksHeaderProps {
  onAddClick?: () => void;
}

export function ScheduledTasksHeader({
  onAddClick,
}: ScheduledTasksHeaderProps) {
  const { t } = useT("translation");

  return (
    <header className="flex h-auto min-h-[64px] shrink-0 items-center justify-between border-b border-border/50 bg-background/50 px-6 py-4 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="flex items-center justify-center p-2 rounded-lg bg-muted text-foreground shrink-0">
          <Clock className="size-5" />
        </div>
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight">
              {t("library.scheduledTasks.page.title")}
            </span>
          </div>
          <span className="text-sm text-muted-foreground">
            {t("library.scheduledTasks.description")}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-4">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={onAddClick}
        >
          <Plus className="size-4" />
          {t("library.scheduledTasks.page.create")}
        </Button>
      </div>
    </header>
  );
}
