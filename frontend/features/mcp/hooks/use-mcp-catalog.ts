"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import type { McpServer, UserMcpInstall } from "@/features/mcp/types";
import { mcpService } from "@/features/mcp/services/mcp-service";
import { useEnvVarsStore } from "@/features/env-vars/hooks/use-env-vars-store";
import { useT } from "@/lib/i18n/client";

export interface McpDisplayItem {
  server: McpServer;
  install?: UserMcpInstall;
}

export function useMcpCatalog() {
  const { t } = useT("translation");
  const [servers, setServers] = useState<McpServer[]>([]);
  const [installs, setInstalls] = useState<UserMcpInstall[]>([]);
  const [selectedServer, setSelectedServer] = useState<McpServer | null>(null);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const envVarStore = useEnvVarsStore();

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const [serversData, installsData] = await Promise.all([
        mcpService.listServers(),
        mcpService.listInstalls(),
      ]);
      setServers(serversData);
      setInstalls(installsData);
    } catch (error) {
      console.error("[MCP] Failed to fetch data:", error);
      toast.error("加载 MCP 列表失败");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggleInstall = useCallback(
    async (serverId: number) => {
      const install = installs.find((entry) => entry.server_id === serverId);
      setLoadingId(serverId);
      try {
        if (install) {
          const updated = await mcpService.updateInstall(install.id, {
            enabled: !install.enabled,
          });
          setInstalls((prev) =>
            prev.map((item) => (item.id === install.id ? updated : item)),
          );
          toast.success(
            updated.enabled
              ? t("library.mcpLibrary.toasts.enabled")
              : t("library.mcpLibrary.toasts.disabled"),
          );
        } else {
          const created = await mcpService.createInstall({
            server_id: serverId,
            enabled: true,
          });
          setInstalls((prev) => [...prev, created]);
          toast.success(t("library.mcpLibrary.toasts.enabled"));
        }
      } catch (error) {
        console.error("[MCP] toggle failed:", error);
        toast.error(t("library.mcpLibrary.toasts.error"));
      } finally {
        setLoadingId(null);
      }
    },
    [installs, t],
  );

  const updateServer = useCallback(
    async (serverId: number, server_config: Record<string, unknown>) => {
      setLoadingId(serverId);
      try {
        const updated = await mcpService.updateServer(serverId, {
          server_config,
        });
        setServers((prev) =>
          prev.map((item) => (item.id === serverId ? updated : item)),
        );
        toast.success(t("library.mcpLibrary.toasts.updated", "保存成功"));
        return updated;
      } catch (error) {
        console.error("[MCP] update failed:", error);
        toast.error(t("library.mcpLibrary.toasts.error"));
      } finally {
        setLoadingId(null);
      }
      return null;
    },
    [t],
  );

  const createServer = useCallback(
    async (name: string, server_config: Record<string, unknown>) => {
      setLoadingId(-1);
      try {
        const created = await mcpService.createServer({
          name,
          server_config,
        });
        setServers((prev) => [created, ...prev]);
        toast.success(t("library.mcpLibrary.toasts.created", "创建成功"));
        return created;
      } catch (error) {
        console.error("[MCP] create failed:", error);
        toast.error(t("library.mcpLibrary.toasts.error"));
      } finally {
        setLoadingId(null);
      }
      return null;
    },
    [t],
  );

  const items: McpDisplayItem[] = useMemo(() => {
    return servers.map((server) => ({
      server,
      install: installs.find((entry) => entry.server_id === server.id),
    }));
  }, [servers, installs]);

  return {
    items,
    servers,
    installs,
    isLoading,
    envVars: envVarStore.envVars,
    selectedServer,
    setSelectedServer,
    toggleInstall,
    updateServer,
    createServer,
    loadingId,
    savingEnvKey: envVarStore.savingEnvKey,
    refreshEnvVars: envVarStore.refreshEnvVars,
    upsertEnvVar: envVarStore.upsertEnvVar,
    removeEnvVar: envVarStore.removeEnvVar,
  };
}
