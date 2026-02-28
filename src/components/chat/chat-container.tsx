"use client";

import type { AgentType } from "@/types/agents";
import { useAgentStream } from "@/hooks/use-agent-stream";
import { MessageList } from "./message-list";
import { MessageInput } from "./message-input";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface ChatContainerProps {
  agentType: AgentType;
  agentName: string;
  agentDescription: string;
  placeholder?: string;
  icon: React.ReactNode;
}

export function ChatContainer({
  agentType,
  agentName,
  agentDescription,
  placeholder,
  icon,
}: ChatContainerProps) {
  const { messages, isStreaming, sendMessage, stopStreaming, clearMessages } =
    useAgentStream(agentType);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <h2 className="font-semibold">{agentName}</h2>
            <p className="text-xs text-muted-foreground">{agentDescription}</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearMessages}
            disabled={isStreaming}
            className="gap-1"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            New Chat
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center p-8">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                {icon}
              </div>
              <h3 className="text-lg font-semibold">{agentName}</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {agentDescription}
              </p>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl">
            <MessageList messages={messages} isStreaming={isStreaming} />
          </div>
        )}
      </div>

      {/* Input */}
      <MessageInput
        onSend={sendMessage}
        onStop={stopStreaming}
        isStreaming={isStreaming}
        placeholder={placeholder}
      />
    </div>
  );
}
