import { supabaseAdmin } from "@/lib/supabase";

export async function generatePaystub(input: {
  employeeId: string;
  userId: string;
  periodStart: string;
  periodEnd: string;
  grossPay: number;
  deductions: Record<string, number>;
  netPay: number;
  hoursWorked?: number;
}): Promise<string> {
  const {
    employeeId,
    userId,
    periodStart,
    periodEnd,
    grossPay,
    deductions,
    netPay,
    hoursWorked,
  } = input;

  // Create or find a pay run for this period
  let { data: payRun } = await supabaseAdmin
    .from("pay_runs")
    .select("id")
    .eq("user_id", userId)
    .eq("period_start", periodStart)
    .eq("period_end", periodEnd)
    .single();

  if (!payRun) {
    const { data: newRun } = await supabaseAdmin
      .from("pay_runs")
      .insert({
        user_id: userId,
        period_start: periodStart,
        period_end: periodEnd,
        status: "completed",
        total_gross: grossPay,
        total_deductions: Object.values(deductions).reduce((a, b) => a + b, 0),
        total_net: netPay,
      })
      .select("id")
      .single();
    payRun = newRun;
  }

  if (!payRun) {
    return JSON.stringify({ error: "Failed to create pay run" });
  }

  // Create paystub
  const { data: paystub, error } = await supabaseAdmin
    .from("paystubs")
    .insert({
      pay_run_id: payRun.id,
      employee_id: employeeId,
      user_id: userId,
      period_start: periodStart,
      period_end: periodEnd,
      gross_pay: grossPay,
      deductions,
      net_pay: netPay,
      hours_worked: hoursWorked || null,
    })
    .select("id")
    .single();

  if (error) {
    return JSON.stringify({ error: error.message });
  }

  return JSON.stringify({
    status: "generated",
    paystubId: paystub.id,
    payRunId: payRun.id,
    grossPay,
    netPay,
    deductions,
    periodStart,
    periodEnd,
    hoursWorked,
  });
}
