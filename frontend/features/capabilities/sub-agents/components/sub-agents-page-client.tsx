"use client";

import { useState } from "react";

import { PullToRefresh } from "@/components/ui/pull-to-refresh";

import { SubAgentsList } from "@/features/capabilities/sub-agents/components/sub-agents-list";
import {
  SubAgentDialog,
  type SubAgentDialogMode,
} from "@/features/capabilities/sub-agents/components/sub-agent-dialog";
import { useSubAgentsStore } from "@/features/capabilities/sub-agents/hooks/use-sub-agents-store";
import type { SubAgent } from "@/features/capabilities/sub-agents/types";
import { CapabilityContentShell } from "@/features/capabilities/components/capability-content-shell";
import { HeaderSearchInput } from "@/components/shared/header-search-input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useT } from "@/lib/i18n/client";

export function SubAgentsPageClient() {
  const store = useSubAgentsStore();
  const { t } = useT("translation");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<SubAgentDialogMode>("create");
  const [editing, setEditing] = useState<SubAgent | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = store.subAgents.filter((agent) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      agent.name.toLowerCase().includes(q) ||
      (agent.description || "").toLowerCase().includes(q) ||
      (agent.prompt || "").toLowerCase().includes(q) ||
      (agent.raw_markdown || "").toLowerCase().includes(q)
    );
  });

  const toolbarSlot = (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="gap-2"
        onClick={() => {
          setDialogMode("create");
          setEditing(null);
          setDialogOpen(true);
        }}
        aria-label={t("library.subAgents.header.add")}
      >
        <Plus className="size-4" />
        <span className="hidden sm:inline">
          {t("library.subAgents.header.add")}
        </span>
      </Button>
      <HeaderSearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={t("library.subAgents.searchPlaceholder")}
        className="w-full md:w-64"
      />
    </>
  );

  return (
    <>
      <div className="flex flex-1 flex-col overflow-hidden">
        <PullToRefresh onRefresh={store.refresh} isLoading={store.isLoading}>
          <CapabilityContentShell>
            <SubAgentsList
              subAgents={filtered}
              savingId={store.savingId}
              isLoading={store.isLoading}
              onToggleEnabled={(id, enabled) => store.setEnabled(id, enabled)}
              onEdit={(agent) => {
                setDialogMode("edit");
                setEditing(agent);
                setDialogOpen(true);
              }}
              onDelete={(agent) => store.deleteSubAgent(agent.id)}
              toolbarSlot={toolbarSlot}
            />
          </CapabilityContentShell>
        </PullToRefresh>
      </div>

      <SubAgentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        initialAgent={editing}
        isSaving={store.savingId !== null}
        onCreate={store.createSubAgent}
        onUpdate={store.updateSubAgent}
      />
    </>
  );
}
