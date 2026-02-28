import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const employeeId = searchParams.get("employeeId");

  let query = supabaseAdmin
    .from("paystubs")
    .select("*, employees(name, email)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (employeeId) {
    query = query.eq("employee_id", employeeId);
  }

  const { data: paystubs } = await query;

  return NextResponse.json({ paystubs: paystubs || [] });
}
