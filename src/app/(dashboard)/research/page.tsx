"use client";

import { ChatContainer } from "@/components/chat/chat-container";
import { Search } from "lucide-react";

export default function ResearchPage() {
  return (
    <ChatContainer
      agentType="research"
      agentName="Research Agent"
      agentDescription="Search the web, analyze sources, and generate comprehensive reports"
      placeholder="What would you like me to research?"
      icon={<Search className="h-6 w-6 text-blue-500" />}
    />
  );
}
