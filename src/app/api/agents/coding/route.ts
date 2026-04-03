import { createAgentHandler } from "@/lib/agent-handler";
import { getCodingAgentConfig } from "@/agents/coding-agent";

export const POST = createAgentHandler("coding", () => getCodingAgentConfig());
