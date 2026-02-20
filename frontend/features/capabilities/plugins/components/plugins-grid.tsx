"use client";

import * as React from "react";
import { Trash2, PowerOff } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { SkeletonShimmer } from "@/components/ui/skeleton-shimmer";
import { StaggeredList } from "@/components/ui/staggered-entrance";
import type {
  Plugin,
  UserPluginInstall,
} from "@/features/capabilities/plugins/types";
import { formatSourceLabel } from "@/features/capabilities/utils/source";
import { useT } from "@/lib/i18n/client";

interface PluginsGridProps {
  plugins: Plugin[];
  installs: UserPluginInstall[];
  loadingId?: number | null;
  isLoading?: boolean;
  onInstall?: (pluginId: number) => void;
  onDeletePlugin?: (pluginId: number) => void;
  onToggleEnabled?: (installId: number, enabled: boolean) => void;
  onBatchToggle?: (enabled: boolean) => void;
  toolbarSlot?: React.ReactNode;
}

export function PluginsGrid({
  plugins,
  installs,
  loadingId,
  isLoading = false,
  onInstall,
  onDeletePlugin,
  onToggleEnabled,
  onBatchToggle,
  toolbarSlot,
}: PluginsGridProps) {
  const { t } = useT("translation");

  const installByPluginId = React.useMemo(() => {
    const map = new Map<number, UserPluginInstall>();
    for (const install of installs) {
      map.set(install.plugin_id, install);
    }
    return map;
  }, [installs]);

  const enabledCount = installs.filter((i) => i.enabled).length;

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-muted/50 px-5 py-3 flex flex-wrap items-center gap-3 md:flex-nowrap md:justify-between">
        <span className="text-sm text-muted-foreground">
          {t("library.pluginsManager.stats.enabled")}: {enabledCount}
        </span>
        <div className="flex flex-1 flex-nowrap items-center justify-end gap-2 overflow-x-auto">
          {installs.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onBatchToggle?.(false)}
              className="gap-2"
            >
              <PowerOff className="size-4" />
              {t("pluginsGrid.turnOffAll")}
            </Button>
          )}
          {toolbarSlot}
        </div>
      </div>

      <div className="space-y-3">
        {isLoading && plugins.length === 0 ? (
          <SkeletonShimmer count={5} itemClassName="min-h-[72px]" gap="md" />
        ) : !isLoading && plugins.length === 0 ? (
          <div className="rounded-xl border border-border/50 bg-muted/10 px-4 py-6 text-sm text-muted-foreground text-center">
            {t("library.pluginsManager.empty")}
          </div>
        ) : (
          <StaggeredList
            items={plugins}
            show={!isLoading}
            keyExtractor={(plugin) => plugin.id}
            staggerDelay={50}
            duration={400}
            renderItem={(plugin) => {
              const install = installByPluginId.get(plugin.id);
              const isInstalled = Boolean(install);
              const isRowLoading =
                isLoading ||
                loadingId === plugin.id ||
                loadingId === install?.id;

              return (
                <div
                  className={`flex items-center gap-4 rounded-xl border px-4 py-3 min-h-[72px] ${
                    isInstalled
                      ? "border-border/70 bg-card"
                      : "border-border/40 bg-muted/20"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium truncate">
                        {plugin.name}
                      </span>
                      {plugin.version && (
                        <Badge
                          variant="outline"
                          className="text-xs text-muted-foreground"
                        >
                          v{plugin.version}
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className="text-xs text-muted-foreground"
                      >
                        {plugin.scope === "system"
                          ? t("library.pluginsManager.scope.system")
                          : t("library.pluginsManager.scope.user")}
                      </Badge>
                    </div>
                    {plugin.description && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {plugin.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {t("library.pluginsManager.fields.source")}:{" "}
                      {formatSourceLabel(plugin.source, t)}
                    </p>
                  </div>

                  {isInstalled && install ? (
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={install.enabled}
                        disabled={isRowLoading}
                        onCheckedChange={(enabled) =>
                          onToggleEnabled?.(install.id, enabled)
                        }
                      />
                      {plugin.scope === "user" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isRowLoading}
                          onClick={() => onDeletePlugin?.(plugin.id)}
                          className="rounded-lg"
                          title={t("common.delete")}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        disabled={isRowLoading}
                        onClick={() => onInstall?.(plugin.id)}
                      >
                        {t("library.pluginsManager.actions.install")}
                      </Button>
                      {plugin.scope === "user" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isRowLoading}
                          onClick={() => onDeletePlugin?.(plugin.id)}
                          className="rounded-lg"
                          title={t("common.delete")}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            }}
          />
        )}
      </div>
    </div>
  );
}
