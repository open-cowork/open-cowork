"use client";

import * as React from "react";
import type { ExecutionSession } from "../model/execution-types";
import { simulateSessionProgress } from "../model/execution-mocks";

const POLLING_INTERVAL = 2500; // 2.5 seconds

/**
 * Hook for fetching and managing execution session data with polling
 * Uses mock data for demo purposes
 */
export function useExecutionSession(sessionId: string) {
  const [session, setSession] = React.useState<ExecutionSession | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);
  const [currentProgress, setCurrentProgress] = React.useState(0);

  // Initialize mock data on first load
  const fetchSession = React.useCallback(async () => {
    if (!sessionId) return;

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      // 生成进度更新
      const updatedSession = simulateSessionProgress(
        sessionId,
        currentProgress,
      );

      // 首次加载时，从 localStorage 读取用户的 prompt
      if (!session) {
        const storedPrompt = localStorage.getItem(
          `session_prompt_${sessionId}`,
        );
        if (storedPrompt) {
          updatedSession.user_prompt = storedPrompt;
        }
      } else {
        // 后续更新时保留已有的 user_prompt
        if (session.user_prompt) {
          updatedSession.user_prompt = session.user_prompt;
        }
      }

      setSession(updatedSession);
      setCurrentProgress(updatedSession.progress);

      setError(null);
    } catch (err) {
      console.error("Failed to fetch session:", err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, currentProgress, session]);

  // Initial load
  React.useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // Polling for updates (every 2.5 seconds)
  // Only poll when session is running or accepted
  React.useEffect(() => {
    const shouldPoll =
      session?.status === "running" || session?.status === "accepted";

    if (!shouldPoll) {
      return; // Stop polling when session is completed or failed
    }

    const interval = setInterval(() => {
      fetchSession();
    }, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchSession, session?.status]);

  return { session, isLoading, error, refetch: fetchSession };
}
