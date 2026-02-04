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
  const hasLoadedOnceRef = useRef(false);
  const requestSeqRef = useRef(0);

  const fetchOnce = useCallback(async () => {
    if (!sessionId) return;
    const seq = (requestSeqRef.current += 1);
    const shouldShowLoading = !hasLoadedOnceRef.current;
    if (shouldShowLoading) {
      setIsLoading(true);
    }
    try {
      const data = await getToolExecutionsAction({
        sessionId,
        limit,
        offset: 0,
      });
      if (seq !== requestSeqRef.current) return;
      setExecutions(data);
      setError(null);
    } catch (err) {
      if (seq !== requestSeqRef.current) return;
      setError(err as Error);
    } finally {
      if (seq !== requestSeqRef.current) return;
      if (shouldShowLoading) {
        setIsLoading(false);
        hasLoadedOnceRef.current = true;
      }
    }
  }, [limit, sessionId]);

  // Reset state when session changes.
  useEffect(() => {
    if (!sessionId) return;
    if (lastSessionIdRef.current === sessionId) return;
    lastSessionIdRef.current = sessionId;
    hasLoadedOnceRef.current = false;
    requestSeqRef.current += 1;
    setExecutions([]);
    setError(null);
    setIsLoading(false);
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
