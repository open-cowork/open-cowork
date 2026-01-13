"use client";

import * as React from "react";
import { Bell, ChevronDown, Coins } from "lucide-react";

import { useT } from "@/app/i18n/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function HomeHeader() {
  const { t } = useT("translation");

  return (
    <header className="flex h-12 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1 px-2 text-sm font-medium"
          title={t("header.switchWorkspace")}
        >
          {t("header.workspace")}
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </Button>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          title={t("header.notifications")}
        >
          <Bell className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 px-2.5 text-sm"
        >
          <Coins className="size-4 text-primary" />
          <span>4,300</span>
        </Button>
        <Avatar className="size-8 cursor-pointer">
          <AvatarFallback className="bg-primary text-xs text-primary-foreground">
            U
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
