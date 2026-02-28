import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { queueVideoGeneration } from "@/tools/marketing/generate-video";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { prompt, sessionId } = await req.json();
  if (!prompt) {
    return NextResponse.json({ error: "Prompt required" }, { status: 400 });
  }

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("clerk_id", userId)
    .single();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const result = await queueVideoGeneration(prompt, user.id, sessionId || null);
  return NextResponse.json(JSON.parse(result));
}
