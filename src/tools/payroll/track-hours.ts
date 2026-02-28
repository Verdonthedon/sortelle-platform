import { supabaseAdmin } from "@/lib/supabase";

export async function trackHours(input: {
  employeeId: string;
  userId: string;
  date: string;
  hours: number;
  description?: string;
}): Promise<string> {
  const { employeeId, userId, date, hours, description } = input;

  if (hours <= 0 || hours > 24) {
    return JSON.stringify({ error: "Hours must be between 0 and 24" });
  }

  const { data, error } = await supabaseAdmin
    .from("time_entries")
    .insert({
      employee_id: employeeId,
      user_id: userId,
      date,
      hours,
      description: description || null,
    })
    .select("id")
    .single();

  if (error) {
    return JSON.stringify({ error: error.message });
  }

  return JSON.stringify({
    status: "tracked",
    timeEntryId: data.id,
    employeeId,
    date,
    hours,
    description,
  });
}
