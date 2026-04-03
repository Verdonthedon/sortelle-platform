import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/lib/auth";
import { runAgent } from "@/agents/base-agent";
import type { BaseAgentConfig } from "@/agents/base-agent";
import { createSSEStream, sseResponse } from "@/lib/streaming";
import type { AgentType } from "@/types/agents";
import type Anthropic from "@anthropic-ai/sdk";

const requestSchema = z.object({
  message: z.string().min(1, "Message is required"),
  sessionId: z.string().uuid().optional(),
});

type ConfigFactory = (userId: string, sessionId: string) => BaseAgentConfig;

/**
 * Creates a POST handler for an agent route.
 * Handles auth, session management, message history, streaming, and message saving.
 */
export function createAgentHandler(agentType: AgentType, getConfig: ConfigFactory) {
  return async function POST(req: Request) {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { message, sessionId } = parsed.data;

    let currentSessionId = sessionId;
    if (!currentSessionId) {
      const { data: session } = await supabaseAdmin
        .from("sessions")
        .insert({
          user_id: user.id,
          agent_type: agentType,
          title: message.slice(0, 100),
        })
        .select("id")
        .single();
      currentSessionId = session?.id ?? "";
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
    const config = getConfig(user.id, currentSessionId!);

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
  };
}
