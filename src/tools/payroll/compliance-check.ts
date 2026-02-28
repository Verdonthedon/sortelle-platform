import { supabaseAdmin } from "@/lib/supabase";

export async function complianceCheck(input: {
  userId: string;
  employeeId?: string;
}): Promise<string> {
  const { userId, employeeId } = input;
  const issues: string[] = [];
  const warnings: string[] = [];

  // Check all employees or specific employee
  let query = supabaseAdmin
    .from("employees")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active");

  if (employeeId) {
    query = query.eq("id", employeeId);
  }

  const { data: employees } = await query;

  if (!employees || employees.length === 0) {
    return JSON.stringify({
      status: "no_employees",
      message: "No active employees found to check",
    });
  }

  for (const emp of employees) {
    // Check minimum wage compliance (Canada federal: $17.30/hr as of 2024)
    if (emp.pay_type === "hourly" && emp.hourly_rate < 15.0) {
      issues.push(
        `${emp.name}: Hourly rate ($${emp.hourly_rate}) may be below provincial minimum wage`
      );
    }

    // Check for missing time entries in current period
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const { data: recentEntries } = await supabaseAdmin
      .from("time_entries")
      .select("id")
      .eq("employee_id", emp.id)
      .gte("date", twoWeeksAgo.toISOString().split("T")[0]);

    if (!recentEntries || recentEntries.length === 0) {
      warnings.push(
        `${emp.name}: No time entries in the last 14 days`
      );
    }

    // Check for overtime (Canadian standard: 44hrs/week in most provinces)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { data: weekEntries } = await supabaseAdmin
      .from("time_entries")
      .select("hours")
      .eq("employee_id", emp.id)
      .gte("date", oneWeekAgo.toISOString().split("T")[0]);

    if (weekEntries) {
      const weeklyHours = weekEntries.reduce(
        (sum: number, e: { hours: number }) => sum + e.hours,
        0
      );
      if (weeklyHours > 44) {
        warnings.push(
          `${emp.name}: ${weeklyHours} hours this week — overtime threshold (44hrs) exceeded`
        );
      }
    }
  }

  return JSON.stringify({
    status: "checked",
    employeesChecked: employees.length,
    issues,
    warnings,
    compliant: issues.length === 0,
    summary:
      issues.length === 0
        ? "All checks passed. No compliance issues found."
        : `Found ${issues.length} issue(s) and ${warnings.length} warning(s).`,
  });
}
