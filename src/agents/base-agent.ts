import Anthropic from "@anthropic-ai/sdk";
import { anthropic, DEFAULT_MODEL } from "@/lib/anthropic";
import type { AgentTool, ToolCallResult } from "@/types/agents";

export interface ToolHandler {
  (input: Record<string, unknown>): Promise<string>;
}

export interface BaseAgentConfig {
  systemPrompt: string;
  tools: Anthropic.Tool[];
  toolHandlers: Record<string, ToolHandler>;
  model?: string;
  maxTurns?: number;
}

export async function runAgent(
  config: BaseAgentConfig,
  messages: Anthropic.MessageParam[],
  onText: (text: string) => void,
  onToolCallStart: (toolCall: ToolCallResult) => void,
  onToolCallEnd: (toolCall: ToolCallResult) => void
) {
  const { systemPrompt, tools, toolHandlers, model = DEFAULT_MODEL, maxTurns = 10 } = config;

  let currentMessages = [...messages];
  let turn = 0;

  while (turn < maxTurns) {
    turn++;

    const stream = anthropic.messages.stream({
      model,
      max_tokens: 8192,
      system: [{ type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }],
      messages: currentMessages,
      tools: tools.length > 0 ? tools : undefined,
    });

    let assistantText = "";
    const toolUseBlocks: Anthropic.ContentBlock[] = [];

    for await (const event of stream) {
      if (event.type === "content_block_delta") {
        if (event.delta.type === "text_delta") {
          assistantText += event.delta.text;
          onText(event.delta.text);
        }
      }
      if (event.type === "content_block_stop") {
        const message = await stream.finalMessage();
        const block = message.content[event.index];
        if (block && block.type === "tool_use") {
          toolUseBlocks.push(block);
        }
      }
    }

    const finalMessage = await stream.finalMessage();

    // Build assistant content blocks
    const assistantContent: Anthropic.ContentBlockParam[] = [];
    for (const block of finalMessage.content) {
      if (block.type === "text") {
        assistantContent.push({ type: "text", text: block.text });
      } else if (block.type === "tool_use") {
        assistantContent.push({
          type: "tool_use",
          id: block.id,
          name: block.name,
          input: block.input as Record<string, unknown>,
        });
      }
    }

    currentMessages.push({ role: "assistant", content: assistantContent });

    // If no tool calls, we're done
    if (finalMessage.stop_reason !== "tool_use") {
      break;
    }

    // Execute tool calls
    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of finalMessage.content) {
      if (block.type !== "tool_use") continue;

      const toolCall: ToolCallResult = {
        id: block.id,
        name: block.name,
        input: block.input as Record<string, unknown>,
        status: "running",
      };
      onToolCallStart(toolCall);

      const handler = toolHandlers[block.name];
      let result: string;

      if (handler) {
        try {
          result = await handler(block.input as Record<string, unknown>);
          toolCall.status = "completed";
          toolCall.output = result;
        } catch (err) {
          result = `Error: ${err instanceof Error ? err.message : String(err)}`;
          toolCall.status = "error";
          toolCall.output = result;
        }
      } else {
        result = `Error: Unknown tool "${block.name}"`;
        toolCall.status = "error";
        toolCall.output = result;
      }

      onToolCallEnd(toolCall);

      toolResults.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: result,
      });
    }

    currentMessages.push({ role: "user", content: toolResults });
  }

  return currentMessages;
}
