"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getToolExecutionsAction } from "@/features/chat/actions/query-actions";
import type { ToolExecutionResponse } from "@/features/chat/types";

interface UseToolExecutionsOptions {
  sessionId?: string;
  isActive?: boolean;
  pollingIntervalMs?: number;
  limit?: number;
}

export function useToolExecutions({
  sessionId,
  isActive = false,
  pollingIntervalMs = 2000,
  limit = 500,
}: UseToolExecutionsOptions) {
  const [executions, setExecutions] = useState<ToolExecutionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const lastSessionIdRef = useRef<string | null>(null);

  const fetchOnce = useCallback(async () => {
    if (!sessionId) return;
    setIsLoading(true);
    try {
      const data = await getToolExecutionsAction({
        sessionId,
        limit,
        offset: 0,
      });
      setExecutions(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [limit, sessionId]);

  // Reset state when session changes.
  useEffect(() => {
    if (!sessionId) return;
    if (lastSessionIdRef.current === sessionId) return;
    lastSessionIdRef.current = sessionId;
    setExecutions([]);
    setError(null);
    void fetchOnce();
  }, [fetchOnce, sessionId]);

  // Poll while active.
  useEffect(() => {
    if (!sessionId) return;
    if (!isActive) return;
    const id = setInterval(() => {
      void fetchOnce();
    }, pollingIntervalMs);
    return () => clearInterval(id);
  }, [fetchOnce, isActive, pollingIntervalMs, sessionId]);

  return { executions, isLoading, error, refetch: fetchOnce };
}
