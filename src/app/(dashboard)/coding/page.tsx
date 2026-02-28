"use client";

import { ChatContainer } from "@/components/chat/chat-container";
import { Code } from "lucide-react";

export default function CodingPage() {
  return (
    <ChatContainer
      agentType="coding"
      agentName="Coding Agent"
      agentDescription="Generate, review, and explain code in any programming language"
      placeholder="Ask me to write, review, or explain code..."
      icon={<Code className="h-6 w-6 text-green-500" />}
    />
  );
}
