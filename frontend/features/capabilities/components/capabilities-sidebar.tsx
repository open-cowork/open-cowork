"use client";

import * as React from "react";
import { PanelLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import type { CapabilityView } from "@/features/capabilities/hooks/use-capability-views";
import { useT } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

interface CapabilitiesSidebarProps {
  views: CapabilityView[];
  activeViewId?: string;
  onSelect?: (viewId: string) => void;
  variant?: "default" | "mobile";
}

const GROUP_ORDER: CapabilityView["group"][] = [
  "featured",
  "primary",
  "secondary",
  "tertiary",
];

export function CapabilitiesSidebar({
  views,
  activeViewId,
  onSelect,
  variant = "default",
}: CapabilitiesSidebarProps) {
  const { t } = useT("translation");
  const isMobileVariant = variant === "mobile";
  const { isMobile, setOpenMobile, setOpen } = useSidebar();

  const handleOpenMainSidebar = React.useCallback(() => {
    if (isMobile) {
      setOpenMobile(true);
      return;
    }
    setOpen(true);
  }, [isMobile, setOpen, setOpenMobile]);

  const handleClick = React.useCallback(
    (viewId: string) => {
      onSelect?.(viewId);
    },
    [onSelect],
  );

  const groupedViews = React.useMemo(
    () =>
      GROUP_ORDER.map((group) =>
        views.filter((view) => view.group === group),
      ).filter((group) => group.length > 0),
    [views],
  );

  const renderItem = (view: CapabilityView, mobile = false) => {
    const Icon = view.icon;
    const isActive = activeViewId === view.id;

    return (
      <button
        key={view.id}
        type="button"
        onClick={() => handleClick(view.id)}
        className={cn(
          mobile
            ? "flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-2 text-sm"
            : "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm",
          isActive
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
        )}
        aria-current={isActive ? "true" : undefined}
      >
        <Icon className="size-4 shrink-0" />
        <span className="truncate font-medium">{view.label}</span>
      </button>
    );
  };

  const verticalNavClassName = isMobileVariant
    ? "flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-4"
    : "hidden flex-1 overflow-y-auto px-2 py-2 md:flex md:flex-col";

  return (
    <aside
      className={cn(
        "flex min-h-0 flex-col border-b border-border/50 md:border-b-0 md:border-r md:border-border/50",
        isMobileVariant && "h-full",
      )}
    >
      <div className="flex h-16 items-center gap-2 px-4">
        {isMobile ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="-ml-2 text-muted-foreground"
            onClick={handleOpenMainSidebar}
            aria-label={t("sidebar.openMain")}
          >
            <PanelLeft className="size-5" />
          </Button>
        ) : null}
        <h2 className="truncate text-lg font-semibold tracking-tight">
          {t("library.title")}
        </h2>
      </div>

      {!isMobileVariant ? (
        <div className="flex gap-4 overflow-x-auto px-4 py-2 md:hidden">
          {groupedViews.map((group, groupIndex) => (
            <React.Fragment key={groupIndex}>
              {group.map((view) => renderItem(view, true))}
              {groupIndex < groupedViews.length - 1 && (
                <div
                  className="my-1 w-px shrink-0 bg-border/80"
                  aria-hidden="true"
                />
              )}
            </React.Fragment>
          ))}
        </div>
      ) : null}

      <nav className={verticalNavClassName}>
        {groupedViews.map((group, groupIndex) => (
          <React.Fragment key={groupIndex}>
            <div className="space-y-1">
              {group.map((view) => renderItem(view))}
            </div>
            {groupIndex < groupedViews.length - 1 && (
              <div
                className="my-3 border-t border-border/70"
                aria-hidden="true"
              />
            )}
          </React.Fragment>
        ))}
      </nav>
    </aside>
  );
}
