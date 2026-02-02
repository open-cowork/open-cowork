"use client";

import * as React from "react";
import {
  AppWindow,
  Loader2,
  Monitor,
  SquareTerminal,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { PanelHeader } from "@/components/shared/panel-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/client";
import { getBrowserScreenshotAction } from "@/features/chat/actions/query-actions";
import type { ToolExecutionResponse } from "@/features/chat/types";
import { useToolExecutions } from "./hooks/use-tool-executions";
import { ApiError } from "@/lib/errors";

const POCO_PLAYWRIGHT_MCP_PREFIX = "mcp____poco_playwright__";

interface ComputerPanelProps {
  sessionId: string;
  sessionStatus?:
    | "running"
    | "accepted"
    | "completed"
    | "failed"
    | "canceled"
    | "stopped";
  browserEnabled?: boolean;
}

function truncateMiddle(value: string, maxLen: number): string {
  const text = value.trim();
  if (text.length <= maxLen) return text;
  if (maxLen <= 8) return text.slice(0, maxLen);
  const head = Math.ceil((maxLen - 3) / 2);
  const tail = Math.floor((maxLen - 3) / 2);
  return `${text.slice(0, head)}...${text.slice(text.length - tail)}`;
}

function pickFirstString(
  input: Record<string, unknown> | null | undefined,
  keys: string[],
): string | null {
  if (!input) return null;
  for (const key of keys) {
    const value = input[key];
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed) return trimmed;
    }
  }
  return null;
}

function getBrowserStepLabel(execution: ToolExecutionResponse): string {
  const name = execution.tool_name || "";
  if (!name.startsWith(POCO_PLAYWRIGHT_MCP_PREFIX)) return name;
  const rawTool = name.slice(POCO_PLAYWRIGHT_MCP_PREFIX.length).trim();
  const action = rawTool.startsWith("browser_")
    ? rawTool.slice("browser_".length)
    : rawTool;

  const input = execution.tool_input || {};
  const summary = (() => {
    if (action === "navigate") {
      return pickFirstString(input, ["url", "href"]);
    }
    if (action === "click" || action === "hover") {
      return pickFirstString(input, ["selector", "text", "role", "name"]);
    }
    if (action === "type" || action === "fill" || action === "press") {
      return (
        pickFirstString(input, ["selector", "role", "name", "text"]) ||
        pickFirstString(input, ["key", "value"])
      );
    }
    return pickFirstString(input, [
      "url",
      "selector",
      "text",
      "role",
      "name",
      "value",
      "query",
      "path",
    ]);
  })();

  const meta = summary ? ` - ${truncateMiddle(summary, 80)}` : "";
  return `${action}${meta}`;
}

function parseBashResult(execution: ToolExecutionResponse): {
  output: string;
  exitCode?: number;
  killed?: boolean;
  shellId?: string | null;
} {
  const raw = execution.tool_output?.["content"];
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (parsed && typeof parsed === "object") {
        const obj = parsed as Record<string, unknown>;
        const output = typeof obj["output"] === "string" ? obj["output"] : raw;
        const exitCode =
          typeof obj["exitCode"] === "number" ? obj["exitCode"] : undefined;
        const killed =
          typeof obj["killed"] === "boolean" ? obj["killed"] : undefined;
        const shellId =
          typeof obj["shellId"] === "string" ? obj["shellId"] : null;
        return { output, exitCode, killed, shellId };
      }
    } catch {
      // fall back to raw
    }
    return { output: raw };
  }
  if (raw === undefined || raw === null) return { output: "" };
  return { output: JSON.stringify(raw) };
}

export function ComputerPanel({
  sessionId,
  sessionStatus,
  browserEnabled = false,
}: ComputerPanelProps) {
  const { t } = useT("translation");
  const isActive = sessionStatus === "running" || sessionStatus === "accepted";

  const { executions, isLoading } = useToolExecutions({
    sessionId,
    isActive,
    pollingIntervalMs: 2000,
    limit: 500,
  });

  const browserSteps = React.useMemo(() => {
    return executions.filter((e) =>
      (e.tool_name || "").startsWith(POCO_PLAYWRIGHT_MCP_PREFIX),
    );
  }, [executions]);

  const bashSteps = React.useMemo(() => {
    return executions.filter((e) => e.tool_name === "Bash");
  }, [executions]);

  const hasBrowser = browserEnabled || browserSteps.length > 0;

  const [activeTab, setActiveTab] = React.useState<string>(
    hasBrowser ? "browser" : "terminal",
  );

  React.useEffect(() => {
    // If browser is disabled, force terminal tab.
    if (!hasBrowser) {
      setActiveTab("terminal");
    } else if (activeTab !== "browser" && activeTab !== "terminal") {
      setActiveTab("browser");
    }
  }, [activeTab, hasBrowser]);

  const [selectedBrowserToolUseId, setSelectedBrowserToolUseId] =
    React.useState<string | null>(null);

  const [browserScreenshotUrls, setBrowserScreenshotUrls] = React.useState<
    Record<string, string | null>
  >({});

  // Auto-select the latest browser step.
  React.useEffect(() => {
    if (!hasBrowser) return;
    if (selectedBrowserToolUseId) return;
    const latestCompleted = [...browserSteps]
      .reverse()
      .find(
        (s) =>
          Boolean(s.tool_output) &&
          typeof s.tool_use_id === "string" &&
          s.tool_use_id,
      );
    const latestAny = [...browserSteps]
      .reverse()
      .find((s) => typeof s.tool_use_id === "string" && s.tool_use_id);

    const pick = latestCompleted?.tool_use_id || latestAny?.tool_use_id;
    if (pick) {
      setSelectedBrowserToolUseId(pick);
    }
  }, [browserSteps, hasBrowser, selectedBrowserToolUseId]);

  // Fetch screenshot URL on demand (cache per tool_use_id).
  React.useEffect(() => {
    if (!sessionId) return;
    if (!selectedBrowserToolUseId) return;
    const selected = browserSteps.find(
      (s) => s.tool_use_id === selectedBrowserToolUseId,
    );
    // Screenshots are uploaded after the tool finishes (ToolResultBlock), so don't fetch
    // for in-flight steps to avoid broken images.
    if (!selected?.tool_output) return;
    if (selectedBrowserToolUseId in browserScreenshotUrls) return;

    let cancelled = false;
    const maxAttempts = 10;
    const retryDelayMs = 800;
    let attempts = 0;

    const tryFetch = async () => {
      attempts += 1;
      try {
        const res = await getBrowserScreenshotAction({
          sessionId,
          toolUseId: selectedBrowserToolUseId,
        });
        if (cancelled) return;
        setBrowserScreenshotUrls((prev) => ({
          ...prev,
          [selectedBrowserToolUseId]: res.url,
        }));
      } catch (err) {
        if (cancelled) return;
        const status =
          err instanceof ApiError
            ? err.statusCode
            : typeof (err as { statusCode?: unknown })?.statusCode === "number"
              ? ((err as { statusCode: number }).statusCode as number)
              : undefined;
        // If the screenshot isn't uploaded yet, retry for a short window.
        if (status === 404 && attempts < maxAttempts) {
          setTimeout(() => {
            if (!cancelled) void tryFetch();
          }, retryDelayMs);
          return;
        }
        setBrowserScreenshotUrls((prev) => ({
          ...prev,
          [selectedBrowserToolUseId]: null,
        }));
      }
    };

    void tryFetch();

    return () => {
      cancelled = true;
    };
  }, [
    browserScreenshotUrls,
    browserSteps,
    selectedBrowserToolUseId,
    sessionId,
  ]);

  const selectedBrowserUrl =
    selectedBrowserToolUseId &&
    selectedBrowserToolUseId in browserScreenshotUrls
      ? browserScreenshotUrls[selectedBrowserToolUseId]
      : undefined;

  const browserMain = (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 min-h-0 rounded-xl border bg-card overflow-hidden">
        <div className="h-full w-full bg-muted/30 flex items-center justify-center">
          {selectedBrowserUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={selectedBrowserUrl}
              alt={t("computer.browser.screenshotAlt")}
              className="w-full h-full object-contain"
            />
          ) : selectedBrowserUrl === null ? (
            <div className="text-sm text-muted-foreground">
              {t("computer.browser.screenshotUnavailable")}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              {t("computer.browser.screenshotLoading")}
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 min-h-0 flex-1">
        <div className="text-xs font-medium text-muted-foreground mb-2">
          {t("computer.browser.steps")}
        </div>
        <ScrollArea className="h-full rounded-xl border bg-card">
          <div className="p-2 space-y-1">
            {browserSteps.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground text-center">
                {t("computer.browser.noSteps")}
              </div>
            ) : (
              browserSteps.map((step) => {
                const toolUseId = step.tool_use_id || "";
                const isSelected = toolUseId === selectedBrowserToolUseId;
                const isDone = Boolean(step.tool_output);
                const isError = step.is_error;
                return (
                  <button
                    key={step.id}
                    type="button"
                    className={cn(
                      "w-full flex items-center gap-2 rounded-md px-2 py-2 text-left transition-colors",
                      isSelected
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-muted/50",
                    )}
                    onClick={() => {
                      if (toolUseId) setSelectedBrowserToolUseId(toolUseId);
                    }}
                    disabled={!toolUseId}
                  >
                    <div className="shrink-0">
                      {!isDone ? (
                        <Loader2 className="size-4 animate-spin text-primary" />
                      ) : isError ? (
                        <XCircle className="size-4 text-destructive" />
                      ) : (
                        <CheckCircle2 className="size-4 text-success" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-mono truncate">
                        {getBrowserStepLabel(step)}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );

  const terminalMain = (
    <div className="h-full min-h-0 rounded-xl border bg-card overflow-hidden">
      <ScrollArea className="h-full">
        <div className="p-3 space-y-4 font-mono text-xs">
          {bashSteps.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground text-center">
              {t("computer.terminal.noSteps")}
            </div>
          ) : (
            bashSteps.map((step) => {
              const cmd =
                typeof step.tool_input?.["command"] === "string"
                  ? (step.tool_input?.["command"] as string)
                  : "";
              const isDone = Boolean(step.tool_output);
              const isError = step.is_error;
              const result = parseBashResult(step);
              return (
                <div key={step.id} className="space-y-1">
                  <div className="flex items-start gap-2">
                    <span className="select-none text-muted-foreground">$</span>
                    <span className="whitespace-pre-wrap break-all flex-1">
                      {cmd || t("computer.terminal.unknownCommand")}
                    </span>
                    <span className="shrink-0">
                      {!isDone ? (
                        <Loader2 className="size-3.5 animate-spin text-primary" />
                      ) : isError ? (
                        <XCircle className="size-3.5 text-destructive" />
                      ) : (
                        <CheckCircle2 className="size-3.5 text-success" />
                      )}
                    </span>
                  </div>
                  {isDone ? (
                    <div className="whitespace-pre-wrap break-words text-foreground/90">
                      {result.output || (
                        <span className="text-muted-foreground">
                          {t("computer.terminal.noOutput")}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="text-muted-foreground">
                      {t("computer.terminal.running")}
                    </div>
                  )}
                  {isDone && typeof result.exitCode === "number" ? (
                    <div
                      className={cn(
                        "text-[11px]",
                        result.exitCode === 0
                          ? "text-muted-foreground"
                          : "text-destructive",
                      )}
                    >
                      {t("computer.terminal.exitCode", {
                        code: String(result.exitCode),
                      })}
                      {result.killed
                        ? ` · ${t("computer.terminal.killed")}`
                        : ""}
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <div className="flex h-full min-h-0 flex-col min-w-0 overflow-hidden">
      <PanelHeader
        icon={Monitor}
        title={t("computer.title")}
        description={t("computer.description")}
      />
      <div className="flex-1 min-h-0 overflow-hidden p-3 sm:p-4">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="h-full min-h-0"
        >
          <div className="flex items-center justify-between gap-2">
            <TabsList>
              {hasBrowser && (
                <TabsTrigger value="browser">
                  <AppWindow className="size-4" />
                  {t("computer.tabs.browser")}
                </TabsTrigger>
              )}
              <TabsTrigger value="terminal">
                <SquareTerminal className="size-4" />
                {t("computer.tabs.terminal")}
              </TabsTrigger>
            </TabsList>

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" />
                {t("status.loading")}
              </div>
            )}
          </div>

          <TabsContent value="browser" className="flex-1 min-h-0">
            {browserMain}
          </TabsContent>
          <TabsContent value="terminal" className="flex-1 min-h-0">
            {terminalMain}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
