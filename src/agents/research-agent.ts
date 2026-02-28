import Anthropic from "@anthropic-ai/sdk";
import type { BaseAgentConfig, ToolHandler } from "./base-agent";
import { webSearch } from "@/tools/research/web-search";
import { analyzeSource } from "@/tools/research/analyze-source";

const SYSTEM_PROMPT = `You are the Sortelle Research Agent — a world-class research analyst who finds, analyzes, and synthesizes information from the web.

You have access to tools for searching the web, analyzing web pages, and generating reports. Use them strategically to provide comprehensive, well-sourced answers.

Research workflow:
1. Start with a web search to find relevant sources
2. Analyze the most promising sources for detailed information
3. Synthesize findings into a clear, well-structured report
4. Always cite your sources with URLs

Guidelines:
- Use multiple searches with different queries for thorough coverage
- Analyze at least 2-3 sources before forming conclusions
- Present findings with clear structure: summary, key findings, details, sources
- Be objective — present multiple perspectives when they exist
- Flag any conflicting information between sources
- Use the generate_report tool to save important research for future reference`;

const tools: Anthropic.Tool[] = [
  {
    name: "web_search",
    description:
      "Search the web using Brave Search. Returns titles, URLs, and descriptions of matching pages.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "Search query" },
        count: {
          type: "number",
          description: "Number of results (1-10, default 5)",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "analyze_source",
    description:
      "Fetch and analyze a web page. Returns the extracted text content from the URL.",
    input_schema: {
      type: "object" as const,
      properties: {
        url: { type: "string", description: "URL of the page to analyze" },
      },
      required: ["url"],
    },
  },
  {
    name: "generate_report",
    description:
      "Save a research report with title, content, and sources. Use after completing research to preserve findings.",
    input_schema: {
      type: "object" as const,
      properties: {
        title: { type: "string", description: "Report title" },
        content: {
          type: "string",
          description: "Full report content in markdown",
        },
        sources: {
          type: "array",
          items: {
            type: "object",
            properties: {
              url: { type: "string" },
              title: { type: "string" },
            },
            required: ["url", "title"],
          },
          description: "List of sources with URLs and titles",
        },
      },
      required: ["title", "content", "sources"],
    },
  },
];

export function getResearchAgentConfig(
  userId?: string,
  sessionId?: string | null
): BaseAgentConfig {
  const toolHandlers: Record<string, ToolHandler> = {
    web_search: async (input) => {
      const { query, count } = input as { query: string; count?: number };
      return webSearch(query, count);
    },
    analyze_source: async (input) => {
      const { url } = input as { url: string };
      return analyzeSource(url);
    },
    generate_report: async (input) => {
      const { title, content, sources } = input as {
        title: string;
        content: string;
        sources: { url: string; title: string }[];
      };
      if (!userId) {
        return JSON.stringify({
          status: "report_generated",
          title,
          note: "Report generated but not saved (no user context)",
        });
      }
      const { saveResearchReport } = await import(
        "@/tools/research/generate-report"
      );
      return saveResearchReport(userId, sessionId || null, title, content, sources);
    },
  };

  return {
    systemPrompt: SYSTEM_PROMPT,
    tools,
    toolHandlers,
  };
}
