import type { AgentType } from "./agents";

export interface AgentChatRequest {
  message: string;
  sessionId?: string;
  agentType: AgentType;
}

export interface CreateSessionRequest {
  agentType: AgentType;
  title?: string;
}

export interface CreateSessionResponse {
  id: string;
  agentType: AgentType;
  title: string;
}

export interface MediaGenerateRequest {
  prompt: string;
  sessionId?: string;
}

export interface MediaGenerateResponse {
  id: string;
  url?: string;
  status: "pending" | "processing" | "completed" | "failed";
}

export interface EmployeeCreateRequest {
  name: string;
  email: string;
  position: string;
  department?: string;
  hourly_rate?: number;
  salary?: number;
  pay_type: "hourly" | "salary";
  start_date: string;
}

export interface PaystubGenerateRequest {
  employee_id: string;
  period_start: string;
  period_end: string;
}

export interface ApiError {
  error: string;
  details?: string;
}
