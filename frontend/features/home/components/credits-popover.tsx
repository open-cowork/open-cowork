"use client";

import * as React from "react";
import { ChevronRight, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Separator } from "@/components/ui/separator";
import { useT } from "@/lib/i18n/client";

interface CreditsPopoverProps {
  trigger: React.ReactNode;
}

export function CreditsPopover({ trigger }: CreditsPopoverProps) {
  const { t } = useT("translation");
  const [isDesktop, setIsDesktop] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const updateMatches = () => setIsDesktop(mediaQuery.matches);
    updateMatches();
    mediaQuery.addEventListener("change", updateMatches);
    return () => mediaQuery.removeEventListener("change", updateMatches);
  }, []);

  const content = (
    <div className="flex flex-col">
      {/* Header Section */}
      <div className="flex items-center justify-between p-5 pb-4">
        <h3 className="text-xl font-semibold tracking-tight">
          {t("creditsPopover.proPlan")}
        </h3>
      </div>

      <Separator className="bg-border/50 border-dashed" />

      {/* Credits Section */}
      <div className="p-5 space-y-6">
        {/* Total Credits */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Sparkles className="size-4" />
              <span className="text-sm font-medium">
                {t("creditsPopover.credits")}
              </span>
            </div>
            <span className="text-xl font-bold tracking-tight">
              {t("creditsPopover.unlimited")}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground/60 pl-6">
            <span>{t("creditsPopover.freeCredits")}</span>
            <span>9999</span>
          </div>
        </div>

        {/* Daily Refresh Section */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <RefreshCw className="size-4" />
              <span className="text-sm font-medium">
                {t("creditsPopover.dailyRefresh")}
              </span>
            </div>
            <span className="text-xl font-bold tracking-tight">9999</span>
          </div>
          <div className="text-xs text-muted-foreground/60 pl-6">
            {t("creditsPopover.dailyRefreshHint")}
          </div>
        </div>
      </div>

      {/* Footer Link */}
      <div className="p-4 pt-0">
        <Button
          variant="ghost"
          className="h-auto p-0 text-muted-foreground hover:text-foreground text-xs flex items-center gap-1 hover:bg-transparent"
        >
          {t("creditsPopover.viewUsage")}
          <ChevronRight className="size-3" />
        </Button>
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <HoverCard openDelay={200} closeDelay={150}>
        <HoverCardTrigger asChild>{trigger}</HoverCardTrigger>
        <HoverCardContent
          className="w-80 p-0 overflow-hidden border-border bg-card shadow-xl"
          align="end"
          sideOffset={8}
        >
          {content}
        </HoverCardContent>
      </HoverCard>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        className="w-80 p-0 overflow-hidden border-border bg-card shadow-xl"
        align="end"
        sideOffset={8}
      >
        {content}
      </PopoverContent>
    </Popover>
  );
}
