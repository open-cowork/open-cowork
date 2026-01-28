"use client";

import { useMemo } from "react";
import { Play, Trash2 } from "lucide-react";

import { useT } from "@/lib/i18n/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { ScheduledTask } from "@/features/scheduled-tasks/types";

interface ScheduledTasksTableProps {
  tasks: ScheduledTask[];
  savingId: string | null;
  onToggleEnabled: (task: ScheduledTask) => void;
  onTrigger: (task: ScheduledTask) => void;
  onDelete: (task: ScheduledTask) => void;
}

export function ScheduledTasksTable({
  tasks,
  savingId,
  onToggleEnabled,
  onTrigger,
  onDelete,
}: ScheduledTasksTableProps) {
  const { t } = useT("translation");

  const rows = useMemo(() => {
    return tasks.map((task) => {
      return {
        ...task,
        nextRunAt: task.next_run_at,
        lastStatus: task.last_run_status ?? "-",
      };
    });
  }, [tasks]);

  return (
    <div className="w-full overflow-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-muted-foreground">
          <tr>
            <th className="px-4 py-3 text-left font-medium">
              {t("library.scheduledTasks.fields.name")}
            </th>
            <th className="px-4 py-3 text-left font-medium">
              {t("library.scheduledTasks.fields.enabled")}
            </th>
            <th className="px-4 py-3 text-left font-medium">
              {t("library.scheduledTasks.fields.cron")}
            </th>
            <th className="px-4 py-3 text-left font-medium">
              {t("library.scheduledTasks.fields.timezone")}
            </th>
            <th className="px-4 py-3 text-left font-medium">
              {t("library.scheduledTasks.fields.nextRunAt")}
            </th>
            <th className="px-4 py-3 text-left font-medium">
              {t("library.scheduledTasks.fields.lastStatus")}
            </th>
            <th className="px-4 py-3 text-right font-medium">
              {t("library.scheduledTasks.fields.actions")}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="px-4 py-10 text-center text-muted-foreground"
              >
                {t("library.scheduledTasks.page.empty")}
              </td>
            </tr>
          ) : null}
          {rows.map((task) => {
            const busy = savingId === task.scheduled_task_id;
            return (
              <tr
                key={task.scheduled_task_id}
                className="border-t border-border"
              >
                <td className="px-4 py-3 font-medium">{task.name}</td>
                <td className="px-4 py-3">
                  <Switch
                    checked={task.enabled}
                    onCheckedChange={() => onToggleEnabled(task)}
                    disabled={busy}
                  />
                </td>
                <td className="px-4 py-3 font-mono text-xs">{task.cron}</td>
                <td className="px-4 py-3">{task.timezone}</td>
                <td className="px-4 py-3 font-mono text-xs">
                  {task.nextRunAt}
                </td>
                <td className="px-4 py-3">{task.lastStatus}</td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      onClick={() => onTrigger(task)}
                      disabled={busy}
                    >
                      <Play className="size-4" />
                      {t("library.scheduledTasks.page.trigger")}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="gap-2"
                      onClick={() => onDelete(task)}
                      disabled={busy}
                    >
                      <Trash2 className="size-4" />
                      {t("common.delete")}
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
