import Anthropic from "@anthropic-ai/sdk";
import type { BaseAgentConfig, ToolHandler } from "./base-agent";

const SYSTEM_PROMPT = `You are the Sortelle Coding Agent — an expert software engineer who helps users write, review, and understand code.

You have access to tools for generating code, reviewing code, and explaining code. Use them when the user asks for help with programming tasks.

Guidelines:
- Always use the appropriate tool for the task
- For code generation, produce clean, well-structured, production-ready code
- For code review, be thorough but constructive — highlight issues and suggest fixes
- For explanations, break down complex code into understandable pieces
- Support all major programming languages
- Include comments in generated code when helpful
- Follow best practices and modern patterns for the language being used`;

const tools: Anthropic.Tool[] = [
  {
    name: "generate_code",
    description:
      "Generate code based on the user's requirements. Use this when the user asks you to write, create, or generate code.",
    input_schema: {
      type: "object" as const,
      properties: {
        language: {
          type: "string",
          description: "Programming language (e.g., python, javascript, typescript, rust, etc.)",
        },
        description: {
          type: "string",
          description: "What the code should do",
        },
        context: {
          type: "string",
          description: "Any additional context like frameworks, libraries, or constraints",
        },
      },
      required: ["language", "description"],
    },
  },
  {
    name: "review_code",
    description:
      "Review code for bugs, performance issues, security concerns, and best practices. Use this when the user asks you to review or check their code.",
    input_schema: {
      type: "object" as const,
      properties: {
        code: { type: "string", description: "The code to review" },
        language: { type: "string", description: "Programming language" },
        focus: {
          type: "string",
          description: "Specific focus areas (e.g., security, performance, readability)",
        },
      },
      required: ["code"],
    },
  },
  {
    name: "explain_code",
    description:
      "Explain what code does in plain language. Use this when the user asks you to explain or help them understand code.",
    input_schema: {
      type: "object" as const,
      properties: {
        code: { type: "string", description: "The code to explain" },
        language: { type: "string", description: "Programming language" },
        detail_level: {
          type: "string",
          enum: ["brief", "detailed", "line-by-line"],
          description: "How detailed the explanation should be",
        },
      },
      required: ["code"],
    },
  },
];

const toolHandlers: Record<string, ToolHandler> = {
  generate_code: async (input) => {
    const { language, description, context } = input as {
      language: string;
      description: string;
      context?: string;
    };
    return JSON.stringify({
      status: "generated",
      language,
      description,
      context: context || "none",
      note: "Code has been generated based on your requirements. See the response for the implementation.",
    });
  },
  review_code: async (input) => {
    const { code, language, focus } = input as {
      code: string;
      language?: string;
      focus?: string;
    };
    return JSON.stringify({
      status: "reviewed",
      codeLength: code.length,
      language: language || "auto-detected",
      focus: focus || "general",
      note: "Code review complete. See the response for findings and suggestions.",
    });
  },
  explain_code: async (input) => {
    const { code, language, detail_level } = input as {
      code: string;
      language?: string;
      detail_level?: string;
    };
    return JSON.stringify({
      status: "explained",
      codeLength: code.length,
      language: language || "auto-detected",
      detailLevel: detail_level || "detailed",
      note: "Explanation generated. See the response for the breakdown.",
    });
  },
};

export function getCodingAgentConfig(): BaseAgentConfig {
  return {
    systemPrompt: SYSTEM_PROMPT,
    tools,
    toolHandlers,
  };
}
