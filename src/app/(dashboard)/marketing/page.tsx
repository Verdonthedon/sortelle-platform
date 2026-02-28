"use client";

import { ChatContainer } from "@/components/chat/chat-container";
import { Megaphone } from "lucide-react";

export default function MarketingPage() {
  return (
    <ChatContainer
      agentType="marketing"
      agentName="Marketing Agent"
      agentDescription="Generate images, videos, ad copy, scripts, and social media content"
      placeholder="What marketing content would you like to create?"
      icon={<Megaphone className="h-6 w-6 text-pink-500" />}
    />
  );
}
