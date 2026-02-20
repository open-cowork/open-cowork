"use client";

import { useState } from "react";

import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import { SlashCommandsList } from "@/features/capabilities/slash-commands/components/slash-commands-list";
import {
  SlashCommandDialog,
  type SlashCommandDialogMode,
} from "@/features/capabilities/slash-commands/components/slash-command-dialog";
import { useSlashCommandsStore } from "@/features/capabilities/slash-commands/hooks/use-slash-commands-store";
import type { SlashCommand } from "@/features/capabilities/slash-commands/types";
import { CapabilityContentShell } from "@/features/capabilities/components/capability-content-shell";
import { HeaderSearchInput } from "@/components/shared/header-search-input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useT } from "@/lib/i18n/client";

export function SlashCommandsPageClient() {
  const store = useSlashCommandsStore();
  const { t } = useT("translation");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] =
    useState<SlashCommandDialogMode>("create");
  const [editing, setEditing] = useState<SlashCommand | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCommands = store.commands.filter((cmd) => {
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    return (
      cmd.name.toLowerCase().includes(lowerQuery) ||
      (cmd.description || "").toLowerCase().includes(lowerQuery) ||
      (cmd.content || "").toLowerCase().includes(lowerQuery)
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
        aria-label={t("library.slashCommands.header.add")}
      >
        <Plus className="size-4" />
        <span className="hidden sm:inline">
          {t("library.slashCommands.header.add")}
        </span>
      </Button>
      <HeaderSearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={t("library.slashCommands.searchPlaceholder")}
        className="w-full md:w-64"
      />
    </>
  );

  return (
    <>
      <div className="flex flex-1 flex-col overflow-hidden">
        <PullToRefresh onRefresh={store.refresh} isLoading={store.isLoading}>
          <CapabilityContentShell>
            <SlashCommandsList
              commands={filteredCommands}
              savingId={store.savingId}
              isLoading={store.isLoading}
              onToggleEnabled={(id, enabled) => store.setEnabled(id, enabled)}
              onEdit={(cmd) => {
                setDialogMode("edit");
                setEditing(cmd);
                setDialogOpen(true);
              }}
              onDelete={(cmd) => store.deleteCommand(cmd.id)}
              toolbarSlot={toolbarSlot}
            />
          </CapabilityContentShell>
        </PullToRefresh>
      </div>

      <SlashCommandDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        initialCommand={editing}
        isSaving={store.savingId !== null}
        onCreate={store.createCommand}
        onUpdate={store.updateCommand}
      />
    </>
  );
}
