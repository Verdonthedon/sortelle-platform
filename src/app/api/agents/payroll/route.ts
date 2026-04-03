import { createAgentHandler } from "@/lib/agent-handler";
import { getPayrollAgentConfig } from "@/agents/payroll-agent";

export const POST = createAgentHandler("payroll", getPayrollAgentConfig);
