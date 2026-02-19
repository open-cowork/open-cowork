"use client";

import * as React from "react";
import {
  Loader2,
  ArrowUp,
  Plus,
  GitBranch,
  Chrome,
  AlarmClock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useT } from "@/lib/i18n/client";
import type { ComposerMode } from "./task-composer";

interface ComposerToolbarProps {
  mode: ComposerMode;
  isSubmitting?: boolean;
  isUploading: boolean;
  canSubmit: boolean;
  repoUrl: string;
  repoDialogOpen: boolean;
  browserEnabled: boolean;
  runScheduleMode: string;
  onOpenRepoDialog: () => void;
  onOpenRunSchedule: () => void;
  onToggleBrowser: () => void;
  onOpenFileInput: () => void;
  onSubmit: () => void;
}

/**
 * Bottom toolbar for the TaskComposer.
 *
 * Contains action buttons: repo, schedule, browser, file upload, and send.
 */
export function ComposerToolbar({
  mode,
  isSubmitting,
  isUploading,
  canSubmit,
  repoUrl,
  repoDialogOpen,
  browserEnabled,
  runScheduleMode,
  onOpenRepoDialog,
  onOpenRunSchedule,
  onToggleBrowser,
  onOpenFileInput,
  onSubmit,
}: ComposerToolbarProps) {
  const { t } = useT("translation");
  const disabled = isSubmitting || isUploading;

  return (
    <div className="flex flex-wrap items-center justify-end gap-1">
      {/* Repo toggle */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant={repoDialogOpen || repoUrl.trim() ? "secondary" : "ghost"}
            size="icon"
            disabled={disabled}
            className="size-9 rounded-xl hover:bg-accent"
            aria-label={t("hero.repo.toggle")}
            title={t("hero.repo.toggle")}
            onClick={onOpenRepoDialog}
          >
            <GitBranch className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={8}>
          {t("hero.repo.toggle")}
        </TooltipContent>
      </Tooltip>

      {/* Run schedule toggle (non-scheduled mode only) */}
      {mode !== "scheduled" && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant={runScheduleMode !== "immediate" ? "secondary" : "ghost"}
              size="icon"
              disabled={disabled}
              className="size-9 rounded-xl hover:bg-accent"
              aria-label={t("hero.runSchedule.toggle")}
              title={t("hero.runSchedule.toggle")}
              onClick={onOpenRunSchedule}
            >
              <AlarmClock className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={8}>
            {t("hero.runSchedule.toggle")}
          </TooltipContent>
        </Tooltip>
      )}

      {/* Browser toggle */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant={browserEnabled ? "secondary" : "ghost"}
            size="icon"
            disabled={disabled}
            className="size-9 rounded-xl hover:bg-accent"
            aria-label={t("hero.browser.toggle")}
            title={t("hero.browser.toggle")}
            onClick={onToggleBrowser}
          >
            <Chrome className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={8}>
          {t("hero.browser.toggle")}
        </TooltipContent>
      </Tooltip>

      {/* File upload */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={disabled}
            className="size-9 rounded-xl hover:bg-accent"
            aria-label={t("hero.importLocal")}
            onClick={onOpenFileInput}
          >
            {isUploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={8}>
          {t("hero.importLocal")}
        </TooltipContent>
      </Tooltip>

      {/* Send */}
      <Button
        onClick={onSubmit}
        disabled={!canSubmit || disabled}
        size="icon"
        className="size-9 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground"
        title={t("hero.send")}
      >
        <ArrowUp className="size-4" />
      </Button>
    </div>
  );
}
