import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
