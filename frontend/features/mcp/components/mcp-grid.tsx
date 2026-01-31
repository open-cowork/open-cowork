"use client";

import * as React from "react";
import { Settings, Power, PowerOff, AlertTriangle, Trash2 } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { McpServer, UserMcpInstall } from "@/features/mcp/types";
import { useT } from "@/lib/i18n/client";

const MCP_LIMIT = 3;

interface McpGridProps {
  servers: McpServer[];
  installs: UserMcpInstall[];
  loadingId?: number | null;
  onToggleInstall?: (serverId: number) => void;
  onUninstall?: (serverId: number, installId: number) => void;
  onEditServer?: (server: McpServer) => void;
  onBatchToggle?: (enabled: boolean) => void;
  totalCount?: number;
}

export function McpGrid({
  servers,
  installs,
  loadingId,
  onToggleInstall,
  onUninstall,
  onEditServer,
  onBatchToggle,
  totalCount,
}: McpGridProps) {
  const { t } = useT("translation");
  const installByServerId = React.useMemo(() => {
    const map = new Map<number, UserMcpInstall>();
    for (const install of installs) {
      map.set(install.server_id, install);
    }
    return map;
  }, [installs]);

  const enabledCount = installs.filter((c) => c.enabled).length;

  return (
    <div className="space-y-6">
      {/* Warning alert */}
      {enabledCount > MCP_LIMIT && (
        <Alert className="border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-500 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-500 *:data-[slot=alert-description]:text-amber-600/90 dark:*:data-[slot=alert-description]:text-amber-500/90">
          <AlertTriangle className="size-4" />
          <AlertDescription>
            {t("hero.warnings.tooManyMcps", { count: enabledCount })}
          </AlertDescription>
        </Alert>
      )}

      {/* Stats bar with batch controls */}
      <div className="rounded-xl bg-muted/50 px-5 py-3 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          可用服务器: {totalCount ?? servers.length} · 已启用: {enabledCount}
        </span>
        {installs.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onBatchToggle?.(true)}
              className="h-7 px-2 text-xs"
            >
              <Power className="size-3 mr-1" />
              全部启用
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onBatchToggle?.(false)}
              className="h-7 px-2 text-xs"
            >
              <PowerOff className="size-3 mr-1" />
              全部禁用
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {servers.map((server) => {
          const install = installByServerId.get(server.id);
          const isEnabled = install?.enabled ?? false;
          const isLoading = loadingId === server.id;
          const isInstalled = Boolean(install);

          return (
            <div
              key={server.id}
              className={`flex items-center gap-4 rounded-xl border px-4 py-3 ${
                install
                  ? "border-border/70 bg-card"
                  : "border-border/40 bg-muted/20"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{server.name}</span>
                  <Badge
                    variant="outline"
                    className="text-xs text-muted-foreground"
                  >
                    {server.scope === "system" ? "系统" : "个人"}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Switch
                  checked={isEnabled}
                  onCheckedChange={() => onToggleInstall?.(server.id)}
                  disabled={isLoading}
                />
                {isInstalled && install && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => onUninstall?.(server.id, install.id)}
                    disabled={isLoading}
                    title={t("library.mcpLibrary.actions.uninstall", "卸载")}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => onEditServer?.(server)}
                  title="设置"
                >
                  <Settings className="size-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
