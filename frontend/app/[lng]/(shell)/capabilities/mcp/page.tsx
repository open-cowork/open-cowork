import { Suspense } from "react";
import { McpPageClient } from "@/features/mcp/components/mcp-page-client";

export default function McpPage() {
  return (
    <Suspense fallback={<div className="h-full w-full" />}>
      <McpPageClient />
    </Suspense>
  );
}
