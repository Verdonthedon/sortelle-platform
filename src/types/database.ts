export interface DbUser {
  id: string;
  clerk_id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbSession {
  id: string;
  user_id: string;
  agent_type: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbMessage {
  id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  tool_calls: Record<string, unknown>[] | null;
  created_at: string;
}

export interface DbMediaAsset {
  id: string;
  user_id: string;
  session_id: string | null;
  type: "image" | "video";
  url: string;
  prompt: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface DbEmployee {
  id: string;
  user_id: string;
  name: string;
  email: string;
  position: string;
  department: string | null;
  hourly_rate: number;
  salary: number | null;
  pay_type: "hourly" | "salary";
  start_date: string;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export interface DbTimeEntry {
  id: string;
  employee_id: string;
  user_id: string;
  date: string;
  hours: number;
  description: string | null;
  created_at: string;
}

export interface DbPayRun {
  id: string;
  user_id: string;
  period_start: string;
  period_end: string;
  status: "draft" | "processing" | "completed";
  total_gross: number;
  total_deductions: number;
  total_net: number;
  created_at: string;
}

export interface DbPaystub {
  id: string;
  pay_run_id: string;
  employee_id: string;
  user_id: string;
  period_start: string;
  period_end: string;
  gross_pay: number;
  deductions: Record<string, number>;
  net_pay: number;
  hours_worked: number | null;
  created_at: string;
}

export interface DbResearchReport {
  id: string;
  user_id: string;
  session_id: string | null;
  title: string;
  content: string;
  sources: { url: string; title: string }[];
  created_at: string;
}
