import { uploadAttachment } from "@/features/attachments/services/attachment-service";
import type { InputFile } from "@/features/chat/types/api/session";
import {
  Loader2,
  ArrowUp,
  Mic,
  Plus,
  FileText,
  Figma,
  GitBranch,
  ListTodo,
  SquareTerminal,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import * as React from "react";
import { useT } from "@/lib/i18n/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileCard } from "@/components/shared/file-card";
import { playFileUploadSound } from "@/lib/utils/sound";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export type ComposerMode = "plan" | "task" | "scheduled";

export interface TaskSendOptions {
  attachments?: InputFile[];
  repo_url?: string | null;
  git_branch?: string | null;
  scheduled_task?: {
    name: string;
    cron: string;
    timezone: string;
    enabled: boolean;
    reuse_session: boolean;
  } | null;
}

export function TaskComposer({
  textareaRef,
  value,
  onChange,
  mode,
  onModeChange,
  onSend,
  isSubmitting,
  onFocus,
  onBlur,
}: {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (value: string) => void;
  mode: ComposerMode;
  onModeChange: (mode: ComposerMode) => void;
  onSend: (options?: TaskSendOptions) => void | Promise<void>;
  isSubmitting?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}) {
  const { t } = useT("translation");
  const isComposing = React.useRef(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [attachments, setAttachments] = React.useState<InputFile[]>([]);

  const [repoDialogOpen, setRepoDialogOpen] = React.useState(false);
  const [repoUrl, setRepoUrl] = React.useState("");
  const [gitBranch, setGitBranch] = React.useState("main");

  const [scheduledName, setScheduledName] = React.useState("");
  const [scheduledCron, setScheduledCron] = React.useState("*/5 * * * *");
  const [scheduledTimezone, setScheduledTimezone] = React.useState("UTC");
  const [scheduledEnabled, setScheduledEnabled] = React.useState(true);
  const [scheduledReuseSession, setScheduledReuseSession] =
    React.useState(true);

  React.useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) setScheduledTimezone(tz);
    } catch {
      // Ignore and keep UTC as fallback.
    }
  }, []);

  React.useEffect(() => {
    if (mode !== "scheduled") return;
    // Default a name when switching to scheduled mode.
    if (scheduledName.trim()) return;
    const derived = value.trim().slice(0, 32);
    if (derived) setScheduledName(derived);
  }, [mode, scheduledName, value]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error(t("hero.toasts.fileTooLarge"));
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    try {
      setIsUploading(true);
      const uploadedFile = await uploadAttachment(file);
      const newAttachments = [...attachments, uploadedFile];
      setAttachments(newAttachments);
      toast.success(t("hero.toasts.uploadSuccess"));
      playFileUploadSound();
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error(t("hero.toasts.uploadFailed"));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeAttachment = (index: number) => {
    const newAttachments = attachments.filter((_, i) => i !== index);
    setAttachments(newAttachments);
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const file = Array.from(items)
      .find((item) => item.kind === "file")
      ?.getAsFile();

    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error(t("hero.toasts.fileTooLarge"));
      return;
    }

    try {
      setIsUploading(true);
      const uploadedFile = await uploadAttachment(file);
      const newAttachments = [...attachments, uploadedFile];
      setAttachments(newAttachments);
      toast.success(t("hero.toasts.uploadSuccess"));
      playFileUploadSound();
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error(t("hero.toasts.uploadFailed"));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = React.useCallback(() => {
    if (isSubmitting || isUploading) return;
    if (mode === "scheduled") {
      if (!value.trim()) return;
      if (!scheduledCron.trim()) return;
      if (!scheduledTimezone.trim()) return;
      const name = scheduledName.trim() || value.trim().slice(0, 32);
      if (!name) return;
    } else {
      if (!value.trim() && attachments.length === 0) return;
    }

    const payload: TaskSendOptions = {
      attachments,
      repo_url: repoUrl.trim() || null,
      git_branch: gitBranch.trim() || null,
      scheduled_task:
        mode === "scheduled"
          ? {
              name: (scheduledName.trim() || value.trim().slice(0, 32)).trim(),
              cron: scheduledCron.trim(),
              timezone: scheduledTimezone.trim() || "UTC",
              enabled: scheduledEnabled,
              reuse_session: scheduledReuseSession,
            }
          : null,
    };

    onSend(payload);
    setAttachments([]);
  }, [
    attachments,
    gitBranch,
    isSubmitting,
    isUploading,
    mode,
    onSend,
    repoUrl,
    scheduledCron,
    scheduledEnabled,
    scheduledName,
    scheduledReuseSession,
    scheduledTimezone,
    value,
  ]);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Attachments Display */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-3 px-4 pt-4">
          {attachments.map((file, i) => (
            <FileCard
              key={i}
              file={file}
              onRemove={() => removeAttachment(i)}
              className="w-48 bg-background border-dashed"
            />
          ))}
        </div>
      )}

      <Dialog open={repoDialogOpen} onOpenChange={setRepoDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{t("hero.repo.dialogTitle")}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="repo-url">{t("hero.repo.urlLabel")}</Label>
              <Input
                id="repo-url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder={t("hero.repo.urlPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="repo-branch">{t("hero.repo.branchLabel")}</Label>
              <Input
                id="repo-branch"
                value={gitBranch}
                onChange={(e) => setGitBranch(e.target.value)}
                placeholder={t("hero.repo.branchPlaceholder")}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRepoDialogOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button type="button" onClick={() => setRepoDialogOpen(false)}>
              {t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 输入区域 */}
      <div className="px-4 pb-3 pt-4">
        <Textarea
          ref={textareaRef}
          value={value}
          disabled={isSubmitting || isUploading}
          onChange={(e) => onChange(e.target.value)}
          onCompositionStart={() => (isComposing.current = true)}
          onCompositionEnd={() => {
            requestAnimationFrame(() => {
              isComposing.current = false;
            });
          }}
          onPaste={handlePaste}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (e.shiftKey) {
                // Allow default behavior (newline)
                return;
              }
              if (
                e.nativeEvent.isComposing ||
                isComposing.current ||
                e.keyCode === 229
              ) {
                return;
              }
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder={
            mode === "scheduled"
              ? t("library.scheduledTasks.placeholders.prompt")
              : mode === "plan"
                ? t("hero.modes.planPlaceholder")
                : t("hero.placeholder")
          }
          className="min-h-[60px] max-h-[40vh] w-full resize-none border-0 bg-transparent dark:bg-transparent p-0 text-base shadow-none placeholder:text-muted-foreground/50 focus-visible:ring-0 disabled:opacity-50"
          rows={2}
        />
      </div>

      {/* Scheduled Task Settings */}
      {mode === "scheduled" ? (
        <div className="px-4 pb-3">
          <div className="rounded-xl border border-border bg-muted/20 p-3">
            {/* Row 1: Name + Cron */}
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="st-name-inline">
                  {t("library.scheduledTasks.fields.name")}
                </Label>
                <Input
                  id="st-name-inline"
                  value={scheduledName}
                  onChange={(e) => setScheduledName(e.target.value)}
                  placeholder={t("library.scheduledTasks.placeholders.name")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="st-cron-inline">
                  {t("library.scheduledTasks.fields.cron")}
                </Label>
                <Input
                  id="st-cron-inline"
                  value={scheduledCron}
                  onChange={(e) => setScheduledCron(e.target.value)}
                  placeholder={"*/5 * * * *"}
                />
              </div>
            </div>

            {/* Row 2: Toggles */}
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="flex items-center justify-between rounded-md border border-border bg-background/60 p-3">
                <div className="text-sm font-medium">
                  {t("library.scheduledTasks.fields.enabled")}
                </div>
                <Switch
                  checked={scheduledEnabled}
                  onCheckedChange={setScheduledEnabled}
                />
              </div>

              <div className="flex items-center justify-between rounded-md border border-border bg-background/60 p-3">
                <div className="text-sm font-medium">
                  {t("library.scheduledTasks.fields.reuseSession")}
                </div>
                <Switch
                  checked={scheduledReuseSession}
                  onCheckedChange={setScheduledReuseSession}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* 底部工具栏 */}
      <div className="flex items-center justify-between px-3 pb-3">
        {/* 左侧：模式选择（Icon + Hover Label） */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-2xl border border-border bg-muted/20 p-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={isSubmitting || isUploading}
                  className={`rounded-xl ${mode === "task" ? "bg-primary/20 text-primary hover:bg-primary/30" : ""}`}
                  aria-label={t("hero.modes.task")}
                  title={t("hero.modes.task")}
                  onClick={() => onModeChange("task")}
                >
                  <SquareTerminal className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={8}>
                <div className="font-medium">{t("hero.modes.task")}</div>
                <div className="opacity-80">{t("hero.modes.taskHelp")}</div>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={isSubmitting || isUploading}
                  className={`rounded-xl ${mode === "plan" ? "bg-primary/20 text-primary hover:bg-primary/30" : ""}`}
                  aria-label={t("hero.modes.plan")}
                  title={t("hero.modes.plan")}
                  onClick={() => onModeChange("plan")}
                >
                  <ListTodo className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={8}>
                <div className="font-medium">{t("hero.modes.plan")}</div>
                <div className="opacity-80">{t("hero.modes.planHelp")}</div>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={isSubmitting || isUploading}
                  className={`rounded-xl ${mode === "scheduled" ? "bg-primary/20 text-primary hover:bg-primary/30" : ""}`}
                  aria-label={t("hero.modes.scheduled")}
                  title={t("hero.modes.scheduled")}
                  onClick={() => onModeChange("scheduled")}
                >
                  <Clock className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={8}>
                <div className="font-medium">{t("hero.modes.scheduled")}</div>
                <div className="opacity-80">
                  {t("hero.modes.scheduledHelp")}
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* 右侧操作按钮 */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant={
                  repoDialogOpen || repoUrl.trim() ? "secondary" : "ghost"
                }
                size="icon"
                disabled={isSubmitting || isUploading}
                className="size-9 rounded-xl hover:bg-accent"
                aria-label={t("hero.repo.toggle")}
                title={t("hero.repo.toggle")}
                onClick={() => setRepoDialogOpen(true)}
              >
                <GitBranch className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={8}>
              {t("hero.repo.toggle")}
            </TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={isSubmitting || isUploading}
                className="size-9 rounded-xl hover:bg-accent"
                title={t("hero.attachFile")}
              >
                {isUploading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Plus className="size-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer"
              >
                <FileText className="mr-2 size-4" />
                <span>{t("hero.importLocal")}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled
                className="opacity-50 cursor-not-allowed"
              >
                <Figma className="mr-2 size-4" />
                <span>{t("hero.importFigma")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={isSubmitting}
            className="size-9 rounded-xl hover:bg-accent"
            title={t("hero.voiceInput")}
          >
            <Mic className="size-4" />
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              (mode === "scheduled"
                ? !value.trim() || !scheduledCron.trim()
                : !value.trim() && attachments.length === 0) ||
              isSubmitting ||
              isUploading
            }
            size="icon"
            className="size-9 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground"
            title={t("hero.send")}
          >
            <ArrowUp className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
