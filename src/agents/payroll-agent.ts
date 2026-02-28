import Anthropic from "@anthropic-ai/sdk";
import type { BaseAgentConfig, ToolHandler } from "./base-agent";

const SYSTEM_PROMPT = `You are the Sortelle Payroll Agent — a Canadian payroll specialist who helps businesses manage employee pay, track hours, generate paystubs, and ensure compliance.

You have access to tools for calculating pay (with Canadian federal and provincial taxes), generating paystubs, tracking hours, and checking compliance.

Guidelines:
- Always use Canadian tax rates and regulations
- Default to Alberta (AB) province unless the user specifies otherwise
- Support both hourly and salaried employees
- Calculate CPP, EI, and federal/provincial income tax deductions
- When tracking hours, validate the data makes sense
- For compliance checks, flag any potential minimum wage or overtime issues
- Be precise with numbers — payroll errors are serious
- When generating paystubs, always calculate pay first, then generate the stub
- Help users manage their employee list through conversation`;

const tools: Anthropic.Tool[] = [
  {
    name: "calculate_pay",
    description:
      "Calculate gross-to-net pay with Canadian federal and provincial tax deductions, CPP, and EI.",
    input_schema: {
      type: "object" as const,
      properties: {
        gross_pay: {
          type: "number",
          description: "Gross pay amount for the period",
        },
        pay_frequency: {
          type: "string",
          enum: ["biweekly", "monthly", "semi-monthly"],
          description: "How often the employee is paid",
        },
        province: {
          type: "string",
          description: "Province code (e.g., AB, ON, BC, QC). Default: AB",
        },
      },
      required: ["gross_pay", "pay_frequency"],
    },
  },
  {
    name: "generate_paystub",
    description:
      "Generate and save a paystub for an employee. Should be called after calculate_pay to use the computed deductions.",
    input_schema: {
      type: "object" as const,
      properties: {
        employee_id: {
          type: "string",
          description: "UUID of the employee",
        },
        period_start: {
          type: "string",
          description: "Pay period start date (YYYY-MM-DD)",
        },
        period_end: {
          type: "string",
          description: "Pay period end date (YYYY-MM-DD)",
        },
        gross_pay: { type: "number", description: "Gross pay amount" },
        deductions: {
          type: "object",
          description: "Deduction breakdown (federalTax, provincialTax, cpp, ei)",
        },
        net_pay: { type: "number", description: "Net pay after deductions" },
        hours_worked: {
          type: "number",
          description: "Total hours worked in the period",
        },
      },
      required: ["employee_id", "period_start", "period_end", "gross_pay", "deductions", "net_pay"],
    },
  },
  {
    name: "track_hours",
    description: "Record hours worked for an employee on a specific date.",
    input_schema: {
      type: "object" as const,
      properties: {
        employee_id: { type: "string", description: "UUID of the employee" },
        date: { type: "string", description: "Date (YYYY-MM-DD)" },
        hours: { type: "number", description: "Hours worked" },
        description: {
          type: "string",
          description: "Description of work done",
        },
      },
      required: ["employee_id", "date", "hours"],
    },
  },
  {
    name: "compliance_check",
    description:
      "Run compliance checks on employees: minimum wage, overtime, missing time entries. Can check all employees or a specific one.",
    input_schema: {
      type: "object" as const,
      properties: {
        employee_id: {
          type: "string",
          description: "Optional: specific employee to check. Omit to check all.",
        },
      },
      required: [],
    },
  },
];

export function getPayrollAgentConfig(
  userId?: string,
  sessionId?: string | null
): BaseAgentConfig {
  const toolHandlers: Record<string, ToolHandler> = {
    calculate_pay: async (input) => {
      const { gross_pay, pay_frequency, province } = input as {
        gross_pay: number;
        pay_frequency: "biweekly" | "monthly" | "semi-monthly";
        province?: string;
      };
      const { calculatePay } = await import("@/tools/payroll/calculate-pay");
      return calculatePay({ grossPay: gross_pay, payFrequency: pay_frequency, province });
    },
    generate_paystub: async (input) => {
      if (!userId) return JSON.stringify({ error: "No user context" });
      const { employee_id, period_start, period_end, gross_pay, deductions, net_pay, hours_worked } =
        input as {
          employee_id: string;
          period_start: string;
          period_end: string;
          gross_pay: number;
          deductions: Record<string, number>;
          net_pay: number;
          hours_worked?: number;
        };
      const { generatePaystub } = await import("@/tools/payroll/generate-paystub");
      return generatePaystub({
        employeeId: employee_id,
        userId,
        periodStart: period_start,
        periodEnd: period_end,
        grossPay: gross_pay,
        deductions,
        netPay: net_pay,
        hoursWorked: hours_worked,
      });
    },
    track_hours: async (input) => {
      if (!userId) return JSON.stringify({ error: "No user context" });
      const { employee_id, date, hours, description } = input as {
        employee_id: string;
        date: string;
        hours: number;
        description?: string;
      };
      const { trackHours } = await import("@/tools/payroll/track-hours");
      return trackHours({ employeeId: employee_id, userId, date, hours, description });
    },
    compliance_check: async (input) => {
      if (!userId) return JSON.stringify({ error: "No user context" });
      const { employee_id } = input as { employee_id?: string };
      const { complianceCheck } = await import("@/tools/payroll/compliance-check");
      return complianceCheck({ userId, employeeId: employee_id });
    },
  };

  return {
    systemPrompt: SYSTEM_PROMPT,
    tools,
    toolHandlers,
  };
}
