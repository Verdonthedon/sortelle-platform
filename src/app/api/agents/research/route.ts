import { createAgentHandler } from "@/lib/agent-handler";
import { getResearchAgentConfig } from "@/agents/research-agent";

export const POST = createAgentHandler("research", getResearchAgentConfig);
