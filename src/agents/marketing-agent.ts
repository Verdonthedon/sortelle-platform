import Anthropic from "@anthropic-ai/sdk";
import type { BaseAgentConfig, ToolHandler } from "./base-agent";

const SYSTEM_PROMPT = `You are the Sortelle Marketing Agent — a creative marketing specialist who generates images, videos, ad copy, scripts, and social media content.

You have access to tools for generating visual content and writing marketing materials. Use them based on what the user needs.

Guidelines:
- For image generation: write detailed, descriptive prompts that produce professional results
- For video generation: note that videos take 2-5 minutes and run in the background
- For ad copy and scripts: follow proven marketing frameworks (AIDA, PAS, etc.)
- For social media: optimize for the specific platform (character limits, hashtags, etc.)
- Always consider the brand voice and target audience
- Suggest A/B testing variations when appropriate`;

const tools: Anthropic.Tool[] = [
  {
    name: "generate_image",
    description:
      "Generate an AI image using FLUX. Provide a detailed prompt describing the desired image.",
    input_schema: {
      type: "object" as const,
      properties: {
        prompt: {
          type: "string",
          description: "Detailed image generation prompt",
        },
        aspect_ratio: {
          type: "string",
          enum: ["1:1", "16:9", "9:16", "4:3", "3:4"],
          description: "Image aspect ratio (default: 1:1)",
        },
      },
      required: ["prompt"],
    },
  },
  {
    name: "generate_video",
    description:
      "Queue an AI video generation. Videos take 2-5 minutes to generate and run in the background.",
    input_schema: {
      type: "object" as const,
      properties: {
        prompt: {
          type: "string",
          description: "Video generation prompt describing the desired scene",
        },
      },
      required: ["prompt"],
    },
  },
  {
    name: "write_script",
    description:
      "Write a video or audio script. Returns a structured script with sections.",
    input_schema: {
      type: "object" as const,
      properties: {
        topic: { type: "string", description: "Script topic" },
        format: {
          type: "string",
          enum: ["youtube", "tiktok", "podcast", "ad", "explainer"],
          description: "Script format",
        },
        duration: {
          type: "string",
          description: "Target duration (e.g., '30 seconds', '5 minutes')",
        },
        tone: {
          type: "string",
          description: "Desired tone (e.g., professional, casual, energetic)",
        },
      },
      required: ["topic", "format"],
    },
  },
  {
    name: "write_copy",
    description:
      "Write marketing copy for ads, emails, landing pages, etc.",
    input_schema: {
      type: "object" as const,
      properties: {
        type: {
          type: "string",
          enum: ["ad", "email", "landing_page", "product_description", "headline"],
          description: "Type of copy",
        },
        product: { type: "string", description: "Product or service name" },
        target_audience: { type: "string", description: "Target audience" },
        key_benefits: { type: "string", description: "Key benefits to highlight" },
        tone: { type: "string", description: "Desired tone" },
      },
      required: ["type", "product"],
    },
  },
  {
    name: "create_social_post",
    description:
      "Create a social media post optimized for a specific platform.",
    input_schema: {
      type: "object" as const,
      properties: {
        platform: {
          type: "string",
          enum: ["instagram", "twitter", "linkedin", "tiktok", "facebook"],
          description: "Social media platform",
        },
        topic: { type: "string", description: "Post topic" },
        include_hashtags: {
          type: "boolean",
          description: "Whether to include hashtags",
        },
        include_cta: {
          type: "boolean",
          description: "Whether to include a call-to-action",
        },
      },
      required: ["platform", "topic"],
    },
  },
];

export function getMarketingAgentConfig(
  userId?: string,
  sessionId?: string | null
): BaseAgentConfig {
  const toolHandlers: Record<string, ToolHandler> = {
    generate_image: async (input) => {
      const { prompt, aspect_ratio } = input as {
        prompt: string;
        aspect_ratio?: string;
      };
      if (!userId) {
        return JSON.stringify({ error: "No user context" });
      }
      const { generateImage } = await import("@/tools/marketing/generate-image");
      return generateImage(prompt, userId, sessionId || null, aspect_ratio);
    },
    generate_video: async (input) => {
      const { prompt } = input as { prompt: string };
      if (!userId) {
        return JSON.stringify({ error: "No user context" });
      }
      const { queueVideoGeneration } = await import(
        "@/tools/marketing/generate-video"
      );
      return queueVideoGeneration(prompt, userId, sessionId || null);
    },
    write_script: async (input) => {
      const { topic, format, duration, tone } = input as {
        topic: string;
        format: string;
        duration?: string;
        tone?: string;
      };
      return JSON.stringify({
        status: "script_requested",
        topic,
        format,
        duration: duration || "not specified",
        tone: tone || "professional",
        note: "Script generation in progress. See the response for the full script.",
      });
    },
    write_copy: async (input) => {
      const { type, product, target_audience, key_benefits, tone } = input as {
        type: string;
        product: string;
        target_audience?: string;
        key_benefits?: string;
        tone?: string;
      };
      return JSON.stringify({
        status: "copy_requested",
        type,
        product,
        targetAudience: target_audience || "general",
        keyBenefits: key_benefits || "not specified",
        tone: tone || "professional",
        note: "Copy writing in progress. See the response for the content.",
      });
    },
    create_social_post: async (input) => {
      const { platform, topic, include_hashtags, include_cta } = input as {
        platform: string;
        topic: string;
        include_hashtags?: boolean;
        include_cta?: boolean;
      };
      return JSON.stringify({
        status: "post_created",
        platform,
        topic,
        includeHashtags: include_hashtags ?? true,
        includeCta: include_cta ?? true,
        note: "Social post created. See the response for the content.",
      });
    },
  };

  return {
    systemPrompt: SYSTEM_PROMPT,
    tools,
    toolHandlers,
  };
}
