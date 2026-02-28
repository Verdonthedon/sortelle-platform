import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { queueVideoGeneration } from "@/tools/marketing/generate-video";

export async function POST(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { prompt, sessionId } = await req.json();
  if (!prompt) {
    return NextResponse.json({ error: "Prompt required" }, { status: 400 });
  }

  const result = await queueVideoGeneration(prompt, user.id, sessionId || null);
  return NextResponse.json(JSON.parse(result));
}
