import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { generateImage } from "@/tools/marketing/generate-image";

export async function POST(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { prompt, sessionId, aspectRatio } = await req.json();
  if (!prompt) {
    return NextResponse.json({ error: "Prompt required" }, { status: 400 });
  }

  const result = await generateImage(prompt, user.id, sessionId || null, aspectRatio);
  return NextResponse.json(JSON.parse(result));
}
