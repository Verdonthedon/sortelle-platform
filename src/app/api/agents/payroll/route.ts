import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { runAgent } from "@/agents/base-agent";
import { getPayrollAgentConfig } from "@/agents/payroll-agent";
import { createSSEStream, sseResponse } from "@/lib/streaming";
import type Anthropic from "@anthropic-ai/sdk";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { message, sessionId } = await req.json();
  if (!message) {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("clerk_id", userId)
    .single();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  let currentSessionId = sessionId;
  if (!currentSessionId) {
    const { data: session } = await supabaseAdmin
      .from("sessions")
      .insert({
        user_id: user.id,
        agent_type: "payroll",
        title: message.slice(0, 100),
      })
      .select("id")
      .single();
    currentSessionId = session?.id;
  }

  await supabaseAdmin.from("messages").insert({
    session_id: currentSessionId,
    role: "user",
    content: message,
  });

  const { data: history } = await supabaseAdmin
    .from("messages")
    .select("role, content")
    .eq("session_id", currentSessionId)
    .order("created_at", { ascending: true })
    .limit(50);

  const messages: Anthropic.MessageParam[] = (history || [])
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

  const { stream, send, close } = createSSEStream();
  const config = getPayrollAgentConfig(user.id, currentSessionId);

  send("message", { type: "session_id", sessionId: currentSessionId });

  let fullText = "";
  const allToolCalls: { name: string; input: Record<string, unknown>; output?: string }[] = [];

  runAgent(
    config,
    messages,
    (text) => {
      fullText += text;
      send("message", { type: "text", content: text });
    },
    (toolCall) => {
      send("message", { type: "tool_call_start", toolCall });
    },
    (toolCall) => {
      allToolCalls.push({ name: toolCall.name, input: toolCall.input, output: toolCall.output });
      send("message", { type: "tool_call_end", toolCall });
    }
  )
    .then(async () => {
      await supabaseAdmin.from("messages").insert({
        session_id: currentSessionId,
        role: "assistant",
        content: fullText,
        tool_calls: allToolCalls.length > 0 ? allToolCalls : null,
      });
      send("message", { type: "done" });
      close();
    })
    .catch((err) => {
      send("message", { type: "error", error: err instanceof Error ? err.message : "Unknown error" });
      close();
    });

  return sseResponse(stream);
}
