import { Suspense } from "react";
import { SkillsPageClient } from "@/features/skills/components/skills-page-client";

export default function SkillsPage() {
  return (
    <Suspense fallback={<div className="h-full w-full" />}>
      <SkillsPageClient />
    </Suspense>
  );
}
