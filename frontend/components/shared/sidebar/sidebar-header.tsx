"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import {
  PanelLeftClose,
  PanelLeftOpen,
  PenSquare,
  Search,
  Sparkles,
  Clock,
} from "lucide-react";

import { useT } from "@/lib/i18n/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useSearchDialog } from "@/features/search/hooks/use-search-dialog";

// ---------------------------------------------------------------------------
// Navigation items
// ---------------------------------------------------------------------------

const TOP_NAV_ITEMS = [
  { id: "search", labelKey: "sidebar.search", icon: Search, href: null },
  {
    id: "capabilities",
    labelKey: "sidebar.library",
    icon: Sparkles,
    href: "/capabilities",
  },
  {
    id: "scheduled-tasks",
    labelKey: "sidebar.scheduledTasks",
    icon: Clock,
    href: "/capabilities/scheduled-tasks",
  },
] as const;

const ICON_ANIMATIONS: Record<string, string> = {
  capabilities:
    "transition-all duration-300 group-hover/menu-item:rotate-12 group-hover/menu-item:scale-110",
  "scheduled-tasks":
    "transition-transform duration-500 group-hover/menu-item:rotate-[360deg]",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface SidebarHeaderSectionProps {
  onNewTask: () => void;
  isSelectionMode: boolean;
}

export function SidebarHeaderSection({
  onNewTask,
  isSelectionMode,
}: SidebarHeaderSectionProps) {
  const { t } = useT("translation");
  const router = useRouter();
  const params = useParams();
  const { toggleSidebar, isMobile, setOpenMobile } = useSidebar();
  const { searchKey } = useSearchDialog();

  const lng = React.useMemo(() => {
    const value = params?.lng;
    if (!value) return undefined;
    return Array.isArray(value) ? value[0] : value;
  }, [params]);

  const closeMobileSidebar = React.useCallback(() => {
    if (isMobile) setOpenMobile(false);
  }, [isMobile, setOpenMobile]);

  return (
    <SidebarHeader className="gap-2 pb-2">
      {/* Logo and collapse toggle */}
      <div className="mb-3 flex items-center justify-between pt-2 group-data-[collapsible=icon]:justify-start">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:gap-0">
          <button
            onClick={toggleSidebar}
            className="group/logo relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg shadow-md transition-all hover:shadow-lg active:scale-95 active:shadow-sm"
            type="button"
          >
            <img
              src="/logo.jpg"
              alt="Poco"
              className="size-full object-cover transition-opacity group-data-[collapsible=icon]:group-hover/logo:opacity-0"
            />
            <PanelLeftOpen className="absolute hidden size-4 group-data-[collapsible=icon]:group-hover/logo:block" />
          </button>
          <span
            onClick={() => router.push(lng ? `/${lng}/home` : "/")}
            className="text-3xl font-bold tracking-tight text-sidebar-foreground group-data-[collapsible=icon]:hidden cursor-pointer hover:opacity-80 transition-opacity font-brand"
          >
            Poco
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="size-8 text-sidebar-foreground hover:bg-sidebar-accent group-data-[collapsible=icon]:hidden"
        >
          <PanelLeftClose className="size-4" />
        </Button>
      </div>

      {!isSelectionMode && (
        <>
          {/* New task button */}
          <SidebarMenu className="group-data-[collapsible=icon]:px-0">
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => {
                  onNewTask();
                  closeMobileSidebar();
                }}
                className="h-[36px] min-w-0 max-w-[calc(var(--sidebar-width)-16px)] w-full justify-start gap-3 rounded-[10px] px-3 py-[7.5px] text-muted-foreground transition-colors hover:bg-sidebar-accent group-data-[collapsible=icon]:w-[var(--sidebar-width-icon)] group-data-[collapsible=icon]:max-w-[var(--sidebar-width-icon)] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group/new-task"
                tooltip={t("sidebar.newTask")}
              >
                <PenSquare className="size-4 shrink-0 transition-transform duration-200 group-hover/new-task:rotate-12 group-hover/new-task:scale-110" />
                <span className="text-sm truncate group-data-[collapsible=icon]:hidden">
                  {t("sidebar.newTask")}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          {/* Navigation items */}
          {TOP_NAV_ITEMS.map(({ id, labelKey, icon: Icon, href }) => {
            const isDisabled = id === "search";
            const iconAnimation = isDisabled ? "" : (ICON_ANIMATIONS[id] ?? "");

            return (
              <SidebarMenu
                key={id}
                className="group-data-[collapsible=icon]:px-0"
              >
                <SidebarMenuItem className="group/menu-item">
                  <SidebarMenuButton
                    onClick={() => {
                      if (isDisabled) return;
                      if (href) {
                        router.push(lng ? `/${lng}${href}` : href);
                        closeMobileSidebar();
                      }
                    }}
                    className={cn(
                      "h-[36px] min-w-0 max-w-[calc(var(--sidebar-width)-16px)] w-full justify-start gap-3 rounded-[10px] px-3 py-[7.5px] text-muted-foreground transition-colors hover:bg-sidebar-accent group-data-[collapsible=icon]:w-[var(--sidebar-width-icon)] group-data-[collapsible=icon]:max-w-[var(--sidebar-width-icon)] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
                      isDisabled &&
                        "opacity-50 cursor-not-allowed hover:bg-transparent",
                    )}
                    tooltip={t(labelKey)}
                  >
                    <Icon className={cn("size-4 shrink-0", iconAnimation)} />
                    <span className="text-sm truncate group-data-[collapsible=icon]:hidden">
                      {t(labelKey)}
                    </span>
                    {id === "search" && (
                      <kbd className="ml-auto text-xs opacity-60 group-data-[collapsible=icon]:hidden">
                        {searchKey}
                      </kbd>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            );
          })}
        </>
      )}

      {isSelectionMode && (
        <div className="px-2 py-1 text-sm font-medium text-sidebar-foreground group-data-[collapsible=icon]:hidden">
          {t("sidebar.batchOperations")}
        </div>
      )}
    </SidebarHeader>
  );
}
