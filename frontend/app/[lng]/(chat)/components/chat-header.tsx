"use client";

import * as React from "react";

import { Bell } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ModelSelector } from "./model-selector";
import { UsageTooltip } from "./usage-tooltip";
import { createMockUsageStats } from "@/app/[lng]/home/model/mocks";
import type { ModelInfo } from "@/app/[lng]/home/model/types";

interface ChatHeaderProps {
  model: ModelInfo;
  onModelChange: (model: ModelInfo) => void;
  title?: string;
}

export function ChatHeader({ model, onModelChange, title }: ChatHeaderProps) {
  const usageStats = React.useMemo(() => createMockUsageStats(), []);

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
      {/* Left side - Model selector and title */}
      <div className="flex items-center gap-4">
        <ModelSelector model={model} onChange={onModelChange} />
        {title && (
          <>
            <div className="h-4 w-px bg-border" />
            <h1 className="text-lg font-medium truncate max-w-md">{title}</h1>
          </>
        )}
      </div>

      {/* Right side - Usage, notifications, avatar */}
      <div className="flex items-center gap-4">
        <UsageTooltip stats={usageStats} />
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-5" />
          <span className="absolute top-1 right-1 size-2 bg-red-500 rounded-full" />
        </Button>
        <Avatar className="size-8">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
            U
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
