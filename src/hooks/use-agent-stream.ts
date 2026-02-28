"use client";

import { useState, useCallback, useRef } from "react";
import type { AgentMessage, AgentType, ToolCallResult } from "@/types/agents";

export function useAgentStream(agentType: AgentType) {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (isStreaming) return;

      const userMessage: AgentMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        createdAt: new Date().toISOString(),
      };

      const assistantMessage: AgentMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
        toolCalls: [],
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsStreaming(true);

      abortRef.current = new AbortController();

      try {
        const res = await fetch(`/api/agents/${agentType}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content,
            sessionId,
            agentType,
          }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          throw new Error(`Agent error: ${res.status}`);
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No reader");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("event: ")) {
              const eventType = line.slice(7);
              continue;
            }
            if (line.startsWith("data: ")) {
              const data = JSON.parse(line.slice(6));

              if (data.type === "text") {
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last && last.role === "assistant") {
                    last.content += data.content;
                  }
                  return [...updated];
                });
              }

              if (data.type === "tool_call_start") {
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last && last.role === "assistant") {
                    last.toolCalls = [...(last.toolCalls || []), data.toolCall];
                  }
                  return [...updated];
                });
              }

              if (data.type === "tool_call_end") {
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last && last.role === "assistant" && last.toolCalls) {
                    const idx = last.toolCalls.findIndex(
                      (tc: ToolCallResult) => tc.id === data.toolCall.id
                    );
                    if (idx !== -1) {
                      last.toolCalls[idx] = data.toolCall;
                    }
                  }
                  return [...updated];
                });
              }

              if (data.type === "session_id") {
                setSessionId(data.sessionId);
              }

              if (data.type === "error") {
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last && last.role === "assistant") {
                    last.content += `\n\nError: ${data.error}`;
                  }
                  return [...updated];
                });
              }
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last && last.role === "assistant") {
              last.content = `Error: ${(err as Error).message}`;
            }
            return [...updated];
          });
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [agentType, isStreaming, sessionId]
  );

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setSessionId(null);
  }, []);

  return {
    messages,
    isStreaming,
    sessionId,
    sendMessage,
    stopStreaming,
    clearMessages,
    setMessages,
    setSessionId,
  };
}
