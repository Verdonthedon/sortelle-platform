"use client";

import { useEffect, useRef } from "react";
import type { AgentMessage } from "@/types/agents";
import { MessageBubble } from "./message-bubble";

interface MessageListProps {
  messages: AgentMessage[];
  isStreaming: boolean;
}

export function MessageList({ messages, isStreaming }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6 p-4">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
