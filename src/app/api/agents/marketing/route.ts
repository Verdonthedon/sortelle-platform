import { createAgentHandler } from "@/lib/agent-handler";
import { getMarketingAgentConfig } from "@/agents/marketing-agent";

export const POST = createAgentHandler("marketing", getMarketingAgentConfig);
