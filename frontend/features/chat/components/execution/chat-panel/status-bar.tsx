"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Zap, Server, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { mcpService } from "@/features/mcp/services/mcp-service";
import { skillsService } from "@/features/skills/services/skills-service";
import type { McpServer } from "@/features/mcp/types";
import type { Skill } from "@/features/skills/types";
import type {
  SkillUse,
  McpStatusItem,
  ConfigSnapshot,
} from "@/features/chat/types";

interface StatusBarProps {
  // Runtime execution data (deprecated, now using configSnapshot)
  skills?: SkillUse[];
  mcpStatuses?: McpStatusItem[];
  // Configuration snapshot from session creation
  configSnapshot?: ConfigSnapshot | null;
}

export function StatusBar({
  skills = [],
  mcpStatuses = [],
  configSnapshot,
}: StatusBarProps) {
  const [mcpServers, setMcpServers] = React.useState<McpServer[]>([]);
  const [allSkills, setAllSkills] = React.useState<Skill[]>([]);

  // Load MCP servers and skills on mount
  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [serversData, skillsData] = await Promise.all([
          mcpService.listServers(),
          skillsService.listSkills(),
        ]);
        setMcpServers(serversData);
        setAllSkills(skillsData);
      } catch (error) {
        console.error("[StatusBar] Failed to load config data:", error);
      }
    };

    loadData();
  }, []);

  // Find MCP servers by IDs from config snapshot
  const configuredMcpServers = React.useMemo(() => {
    const mcpServerIds = configSnapshot?.mcp_server_ids ?? [];
    return mcpServerIds
      .map((id) => mcpServers.find((server) => server.id === id))
      .filter((server): server is McpServer => server !== undefined);
  }, [configSnapshot?.mcp_server_ids, mcpServers]);

  // Find skills by IDs from config snapshot
  const configuredSkills = React.useMemo(() => {
    const skillIds = configSnapshot?.skill_ids ?? [];
    return skillIds
      .map((id) => allSkills.find((skill) => skill.id === id))
      .filter((skill): skill is Skill => skill !== undefined);
  }, [configSnapshot?.skill_ids, allSkills]);

  // Prefer config snapshot data, fallback to runtime data
  const hasSkills = configuredSkills.length > 0 || skills.length > 0;
  const hasMcp = configuredMcpServers.length > 0 || mcpStatuses.length > 0;

  if (!hasSkills && !hasMcp) {
    return null;
  }

  // Display skills from config snapshot (preferred) or runtime data
  const displaySkills =
    configuredSkills.length > 0
      ? configuredSkills.map((skill) => ({
          id: String(skill.id),
          name: skill.name,
          status: "configured" as const,
        }))
      : skills;

  // Display MCP servers from config snapshot (preferred) or runtime data
  const displayMcpServers =
    configuredMcpServers.length > 0
      ? configuredMcpServers.map((server) => ({
          server_name: server.name,
          status: "configured" as const,
        }))
      : mcpStatuses;

  const getSkillStatusIcon = (status: string) => {
    if (status === "configured") {
      return <CheckCircle2 className="size-3 text-foreground" />;
    }
    switch (status) {
      case "completed":
        return <CheckCircle2 className="size-3 text-foreground" />;
      case "failed":
        return <XCircle className="size-3 text-muted-foreground/60" />;
      default:
        return <AlertCircle className="size-3 text-muted-foreground/80" />;
    }
  };

  const getMcpStatusIcon = (status: string) => {
    if (status === "configured") {
      return <CheckCircle2 className="size-3 text-foreground" />;
    }
    switch (status) {
      case "connected":
        return <CheckCircle2 className="size-3 text-foreground" />;
      case "disconnected":
        return <XCircle className="size-3 text-muted-foreground/60" />;
      default:
        return <AlertCircle className="size-3 text-muted-foreground/80" />;
    }
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2.5 border-t border-border bg-muted/20">
      <TooltipProvider delayDuration={200}>
        {/* Skills Card */}
        {hasSkills && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border/60 hover:border-border hover:shadow-sm transition-all cursor-pointer group">
                <Zap className="size-3.5 text-foreground group-hover:text-foreground/80 transition-colors" />
                <span className="text-xs font-medium text-foreground">
                  {configuredSkills.length > 0 ? "技能配置" : "技能使用"}
                </span>
                <Badge
                  variant="secondary"
                  className="text-xs h-5 px-1.5 bg-muted text-foreground"
                >
                  {displaySkills.length}
                </Badge>
              </div>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="p-2 bg-card border-border shadow-lg"
              sideOffset={8}
            >
              <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                {displaySkills.map((skill) => (
                  <div
                    key={skill.id}
                    className="flex items-center gap-2 text-sm px-1"
                  >
                    {getSkillStatusIcon(skill.status)}
                    <span className="text-foreground">{skill.name}</span>
                  </div>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        )}

        {/* MCP Card */}
        {hasMcp && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border/60 hover:border-border hover:shadow-sm transition-all cursor-pointer group">
                <Server className="size-3.5 text-foreground group-hover:text-foreground/80 transition-colors" />
                <span className="text-xs font-medium text-foreground">
                  {configuredMcpServers.length > 0
                    ? "MCP 服务器配置"
                    : "MCP 服务器"}
                </span>
                <Badge
                  variant="secondary"
                  className="text-xs h-5 px-1.5 bg-muted text-foreground"
                >
                  {displayMcpServers.length}
                </Badge>
              </div>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="p-2 bg-card border-border shadow-lg"
              sideOffset={8}
            >
              <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                {displayMcpServers.map((mcp, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-sm px-1"
                  >
                    {getMcpStatusIcon(mcp.status)}
                    <span className="text-foreground font-mono">
                      {mcp.server_name}
                    </span>
                  </div>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </TooltipProvider>
    </div>
  );
}
