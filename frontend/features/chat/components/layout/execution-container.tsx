"use client";

import * as React from "react";
import { ChatPanel } from "../execution/chat-panel/chat-panel";
import { ArtifactsPanel } from "../execution/file-panel/artifacts-panel";
import { ComputerPanel } from "../execution/computer-panel/computer-panel";
import { MobileExecutionView } from "./mobile-execution-view";
import { useExecutionSession } from "@/features/chat/hooks/use-execution-session";
import { useTaskHistoryContext } from "@/features/projects/contexts/task-history-context";
import { useIsMobile } from "@/lib/hooks/use-mobile";
import { Loader2 } from "lucide-react";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

interface ExecutionContainerProps {
  sessionId: string;
}

export function ExecutionContainer({ sessionId }: ExecutionContainerProps) {
  const { refreshTasks } = useTaskHistoryContext();
  const { session, isLoading, error, updateSession } = useExecutionSession({
    sessionId,
    onPollingStop: refreshTasks,
  });
  const isMobile = useIsMobile();
  const isSessionActive =
    session?.status === "running" || session?.status === "accepted";
  const browserEnabled = Boolean(
    session?.config_snapshot?.browser_enabled ||
    session?.state_patch?.browser?.enabled,
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background select-text">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/20" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-background select-text">
        <div className="text-center">
          <p className="text-destructive mb-2">Error loading session</p>
          <p className="text-muted-foreground text-sm">
            {error.message || "Unknown error"}
          </p>
        </div>
      </div>
    );
  }

  // Mobile view (under 768px)
  if (isMobile) {
    return (
      <MobileExecutionView
        session={session}
        sessionId={sessionId}
        updateSession={updateSession}
      />
    );
  }

  // Desktop resizable layout
  return (
    <div className="flex h-screen overflow-hidden bg-background select-text">
      <ResizablePanelGroup direction="horizontal">
        {/* Left panel - Chat with status cards (45%) */}
        <ResizablePanel defaultSize={45} minSize={20}>
          <div className="h-full flex flex-col min-w-0">
            <ChatPanel
              session={session}
              statePatch={session?.state_patch}
              progress={session?.progress}
              currentStep={session?.state_patch.current_step ?? undefined}
              updateSession={updateSession}
            />
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right panel - Artifacts (55%) */}
        <ResizablePanel defaultSize={55} minSize={20}>
          <div className="h-full flex flex-col bg-muted/30 min-w-0">
            {isSessionActive ? (
              <ComputerPanel
                sessionId={sessionId}
                sessionStatus={session?.status}
                browserEnabled={browserEnabled}
              />
            ) : (
              <ArtifactsPanel
                fileChanges={session?.state_patch.workspace_state?.file_changes}
                sessionId={sessionId}
                sessionStatus={session?.status}
              />
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
