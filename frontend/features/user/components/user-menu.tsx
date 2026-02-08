"use client";

import * as React from "react";
import { CreditCard, Home, LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

import { useT } from "@/lib/i18n/client";
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
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface UserMenuProps {
  trigger?: React.ReactNode;
  onOpenSettings: () => void;
}

export function UserMenu({ trigger, onOpenSettings }: UserMenuProps) {
  const { t } = useT("translation");
  const router = useRouter();
  const [isDesktop, setIsDesktop] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const updateMatches = () => setIsDesktop(mediaQuery.matches);
    updateMatches();
    mediaQuery.addEventListener("change", updateMatches);
    return () => mediaQuery.removeEventListener("change", updateMatches);
  }, []);

  const handleLogout = () => {
    // Mock logout logic
    console.log("Logging out...");
    router.push("/login");
  };

  const triggerNode = trigger || (
    <Avatar className="size-8 cursor-pointer">
      <AvatarFallback className="bg-muted text-xs text-muted-foreground">
        U
      </AvatarFallback>
    </Avatar>
  );

  const content = (
    <div className="flex flex-col gap-1">
      {/* Credits Summary */}
      <div className="flex items-center justify-between px-2 py-1.5 text-sm">
        <span className="text-muted-foreground font-medium flex items-center gap-2">
          <CreditCard className="size-3.5" />
          {t("userMenu.credits")}
        </span>
        <span className="font-semibold">
          {t("queryActions.creditUnlimited")}
        </span>
      </div>
      <Separator className="my-1" />

      <Button
        variant="ghost"
        size="sm"
        className="justify-start h-8 font-normal px-2"
        onClick={() => window.open("https://open-cowork.com", "_blank")}
      >
        <Home className="mr-2 size-4" />
        {t("userMenu.home")}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="justify-start h-8 font-normal px-2"
        onClick={onOpenSettings}
      >
        <Settings className="mr-2 size-4" />
        {t("userMenu.settings")}
      </Button>
      <Separator className="my-1" />
      <Button
        variant="ghost"
        size="sm"
        className="justify-start h-8 font-normal px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={handleLogout}
      >
        <LogOut className="mr-2 size-4" />
        {t("userMenu.logout")}
      </Button>
    </div>
  );

  if (isDesktop) {
    return (
      <HoverCard openDelay={200} closeDelay={150}>
        <HoverCardTrigger asChild>{triggerNode}</HoverCardTrigger>
        <HoverCardContent className="w-64 p-2" align="end" sideOffset={8}>
          {content}
        </HoverCardContent>
      </HoverCard>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>{triggerNode}</PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="end" sideOffset={8}>
        {content}
      </PopoverContent>
    </Popover>
  );
}
