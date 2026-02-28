export type AgentType = "marketing" | "research" | "coding" | "payroll";

export interface AgentConfig {
  id: AgentType;
  name: string;
  description: string;
  icon: string;
  color: string;
  systemPrompt: string;
  tools: AgentTool[];
}

export interface AgentTool {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

export interface AgentMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolCalls?: ToolCallResult[];
  createdAt: string;
}

export interface ToolCallResult {
  id: string;
  name: string;
  input: Record<string, unknown>;
  output?: string;
  status: "pending" | "running" | "completed" | "error";
}

export interface StreamEvent {
  type: "text" | "tool_call_start" | "tool_call_end" | "error" | "done";
  content?: string;
  toolCall?: ToolCallResult;
  error?: string;
}
