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
  const sessionId = searchParams.get("sessionId");
  const agentType = searchParams.get("agentType");

  // Load specific session with messages
  if (sessionId) {
    const { data: messages } = await supabaseAdmin
      .from("messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    return NextResponse.json({ messages: messages || [] });
  }

  // List sessions
  let query = supabaseAdmin
    .from("sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(50);

  if (agentType) {
    query = query.eq("agent_type", agentType);
  }

  const { data: sessions } = await query;

  return NextResponse.json({ sessions: sessions || [] });
}
