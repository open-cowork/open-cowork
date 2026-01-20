"use client";

import * as React from "react";
import { Loader2, Settings } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { McpServer, UserMcpInstall } from "@/features/mcp/types";

interface McpGridProps {
  servers: McpServer[];
  installs: UserMcpInstall[];
  loadingId?: number | null;
  onToggleInstall?: (serverId: number) => void;
  onEditServer?: (server: McpServer) => void;
}

export function McpGrid({
  servers,
  installs,
  loadingId,
  onToggleInstall,
  onEditServer,
}: McpGridProps) {
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
      <div className="rounded-xl bg-muted/50 px-5 py-3">
        <span className="text-sm text-muted-foreground">
          可用服务器: {servers.length} · 已启用: {enabledCount}
        </span>
      </div>

      <div className="space-y-2">
        {servers.map((server) => {
          const install = installByServerId.get(server.id);
          const isEnabled = install?.enabled ?? false;
          const isLoading = loadingId === server.id;

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
                <div className="font-medium">
                  {server.display_name || server.name}
                </div>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <Badge
                    variant="outline"
                    className="text-xs text-muted-foreground"
                  >
                    {server.scope === "system" ? "系统" : "用户"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {server.name}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => onEditServer?.(server)}
                      title="设置"
                    >
                      <Settings className="size-4" />
                    </Button>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={() => onToggleInstall?.(server.id)}
                    />
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
