"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Puzzle, Server, Clock, Sparkles, ArrowRight } from "lucide-react";

import { useT } from "@/app/i18n/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface LibraryCard {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  actionLabel: string;
  actionHref: string;
  badge?: string;
  comingSoon?: boolean;
}

export function LibraryGrid() {
  const { t } = useT("translation");
  const router = useRouter();

  const cards: LibraryCard[] = React.useMemo(
    () => [
      {
        id: "skills-store",
        icon: <Puzzle className="size-6" />,
        title: t("library.skillsStore.title"),
        description: t("library.skillsStore.description"),
        features: [
          t("library.skillsStore.feature1"),
          t("library.skillsStore.feature2"),
          t("library.skillsStore.feature3"),
        ],
        actionLabel: t("library.skillsStore.action"),
        actionHref: "/library/skills",
      },
      {
        id: "mcp-install",
        icon: <Server className="size-6" />,
        title: t("library.mcpInstall.title"),
        description: t("library.mcpInstall.description"),
        features: [
          t("library.mcpInstall.feature1"),
          t("library.mcpInstall.feature2"),
          t("library.mcpInstall.feature3"),
        ],
        actionLabel: t("library.mcpInstall.action"),
        actionHref: "/library/mcp",
        badge: t("library.comingSoon"),
        comingSoon: true,
      },
      {
        id: "scheduled-tasks",
        icon: <Clock className="size-6" />,
        title: t("library.scheduledTasks.title"),
        description: t("library.scheduledTasks.description"),
        features: [
          t("library.scheduledTasks.feature1"),
          t("library.scheduledTasks.feature2"),
          t("library.scheduledTasks.feature3"),
        ],
        actionLabel: t("library.scheduledTasks.action"),
        actionHref: "/library/scheduled-tasks",
        badge: t("library.comingSoon"),
        comingSoon: true,
      },
      {
        id: "more",
        icon: <Sparkles className="size-6" />,
        title: t("library.more.title"),
        description: t("library.more.description"),
        features: [
          t("library.more.feature1"),
          t("library.more.feature2"),
          t("library.more.feature3"),
        ],
        actionLabel: t("library.more.action"),
        actionHref: "/library/more",
        badge: t("library.comingSoon"),
        comingSoon: true,
      },
    ],
    [t],
  );

  const handleCardClick = React.useCallback(
    (href: string, comingSoon?: boolean) => {
      if (comingSoon) {
        console.log("Coming soon:", href);
        return;
      }
      router.push(href);
    },
    [router],
  );

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.id}
          className={cn(
            "group relative flex flex-col overflow-hidden rounded-2xl bg-card border border-border/50",
            "transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/20",
            card.comingSoon && "opacity-80",
          )}
        >
          {/* Top colored line/gradient */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/10 via-primary/50 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="p-6 flex flex-col h-full">
            <div className="flex items-start justify-between mb-6">
              {/* Icon */}
              <div
                className={cn(
                  "flex size-14 shrink-0 items-center justify-center",
                  "rounded-2xl border border-border/50",
                  "bg-gradient-to-br from-muted to-background", // Subtle gradient
                  "text-primary shadow-sm",
                  "group-hover:scale-105 group-hover:shadow-md",
                  "transition-all duration-300",
                )}
              >
                {card.icon}
              </div>

              {/* Badge */}
              {card.badge && (
                <div
                  className={cn(
                    "px-3 py-1 text-xs font-medium tracking-wide",
                    "rounded-full border border-border/50",
                    "bg-muted/50 text-muted-foreground",
                    "backdrop-blur-sm",
                  )}
                >
                  {card.badge}
                </div>
              )}
            </div>

            {/* Title & Description */}
            <div className="space-y-2 mb-6">
              <h3 className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors duration-200">
                {card.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {card.description}
              </p>
            </div>

            {/* Features (Pills) */}
            <div className="mt-auto space-y-4">
              <div className="flex flex-wrap gap-2">
                {card.features.map((feature, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center rounded-lg bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary/80"
                  >
                    {feature}
                  </span>
                ))}
              </div>

              {/* Action Button */}
              <Button
                variant={card.comingSoon ? "ghost" : "default"}
                size="lg"
                className={cn(
                  "w-full justify-between mt-6",
                  card.comingSoon &&
                    "cursor-not-allowed hover:bg-transparent text-muted-foreground border-dashed border",
                  !card.comingSoon &&
                    "shadow-lg shadow-primary/20 hover:shadow-primary/30",
                )}
                onClick={() =>
                  handleCardClick(card.actionHref, card.comingSoon)
                }
                disabled={card.comingSoon}
              >
                <span className="font-semibold">{card.actionLabel}</span>
                {!card.comingSoon && (
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                )}
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
