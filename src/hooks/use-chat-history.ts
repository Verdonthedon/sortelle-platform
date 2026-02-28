"use client";

import { useState, useCallback } from "react";
import type { AgentType } from "@/types/agents";

interface SessionSummary {
  id: string;
  agent_type: AgentType;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export function useChatHistory() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSessions = useCallback(async (agentType?: AgentType) => {
    setLoading(true);
    try {
      const params = agentType ? `?agentType=${agentType}` : "";
      const res = await fetch(`/api/sessions${params}`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSession = useCallback(async (sessionId: string) => {
    const res = await fetch(`/api/sessions?sessionId=${sessionId}`);
    if (res.ok) {
      const data = await res.json();
      return data.messages || [];
    }
    return [];
  }, []);

  return { sessions, loading, fetchSessions, loadSession };
}
