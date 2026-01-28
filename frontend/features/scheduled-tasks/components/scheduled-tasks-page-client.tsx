"use client";

import { useState } from "react";

import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import { CreateScheduledTaskDialog } from "@/features/scheduled-tasks/components/create-scheduled-task-dialog";
import { ScheduledTasksHeader } from "@/features/scheduled-tasks/components/scheduled-tasks-header";
import { ScheduledTasksTable } from "@/features/scheduled-tasks/components/scheduled-tasks-table";
import { useScheduledTasksStore } from "@/features/scheduled-tasks/hooks/use-scheduled-tasks-store";
import type { ScheduledTask } from "@/features/scheduled-tasks/types";

export function ScheduledTasksPageClient() {
  const [createOpen, setCreateOpen] = useState(false);
  const store = useScheduledTasksStore();

  const handleToggleEnabled = async (task: ScheduledTask) => {
    await store.updateTask(task.scheduled_task_id, {
      enabled: !task.enabled,
    });
  };

  return (
    <>
      <ScheduledTasksHeader onAddClick={() => setCreateOpen(true)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <PullToRefresh onRefresh={store.refresh} isLoading={store.isLoading}>
          <div className="flex flex-1 flex-col px-6 py-6 overflow-auto">
            <div className="w-full max-w-6xl mx-auto">
              <ScheduledTasksTable
                tasks={store.tasks}
                savingId={store.savingId}
                onToggleEnabled={handleToggleEnabled}
                onTrigger={async (task) => {
                  await store.triggerTask(task.scheduled_task_id);
                }}
                onDelete={async (task) => {
                  await store.removeTask(task.scheduled_task_id);
                }}
              />
            </div>
          </div>
        </PullToRefresh>
      </div>

      <CreateScheduledTaskDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={async (input) => {
          await store.createTask(input);
        }}
        isSaving={store.savingId === "create"}
      />
    </>
  );
}
