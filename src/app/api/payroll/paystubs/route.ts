import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("clerk_id", userId)
    .single();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
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
