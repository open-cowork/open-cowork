"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Puzzle, Server, Clock, Sparkles, Key } from "lucide-react";

import { useT } from "@/lib/i18n/client";
import { FeatureCard } from "@/components/ui/feature-card";

interface CapabilitiesCard {
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

export function CapabilitiesGrid() {
  const { t } = useT("translation");
  const router = useRouter();
  const params = useParams();
  const lng = React.useMemo(() => {
    const value = params?.lng;
    if (!value) return undefined;
    return Array.isArray(value) ? value[0] : value;
  }, [params]);

  const cards: CapabilitiesCard[] = React.useMemo(
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
        actionHref: "/capabilities/skills",
        comingSoon: false,
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
        actionHref: "/capabilities/mcp",
        comingSoon: false,
      },
      {
        id: "env-vars",
        icon: <Key className="size-6" />,
        title: t("library.envVars.card.title", "环境变量"),
        description: t(
          "library.envVars.card.description",
          "管理 API Key 和密钥",
        ),
        features: [
          t("library.envVars.card.feature1", "安全存储敏感信息"),
          t("library.envVars.card.feature2", "支持多个 MCP 共享使用"),
          t("library.envVars.card.feature3", "加密传输和存储"),
        ],
        actionLabel: t("library.envVars.card.action", "管理变量"),
        actionHref: "/capabilities/env-vars",
        comingSoon: false,
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
        actionHref: "/capabilities/scheduled-tasks",
        comingSoon: false,
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
        actionHref: "/capabilities/more",
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
      router.push(lng ? `/${lng}${href}` : href);
    },
    [router, lng],
  );

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <FeatureCard
          key={card.id}
          id={card.id}
          icon={card.icon}
          title={card.title}
          description={card.description}
          actionLabel={card.actionLabel}
          badge={card.badge}
          comingSoon={card.comingSoon}
          onAction={() => handleCardClick(card.actionHref, card.comingSoon)}
        />
      ))}
    </div>
  );
}
