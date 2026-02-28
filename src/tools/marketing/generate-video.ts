import { inngest } from "@/lib/inngest";

export async function queueVideoGeneration(
  prompt: string,
  userId: string,
  sessionId: string | null
): Promise<string> {
  try {
    await inngest.send({
      name: "marketing/video.generate",
      data: {
        prompt,
        userId,
        sessionId,
      },
    });

    return JSON.stringify({
      status: "queued",
      message:
        "Video generation has been queued. It typically takes 2-5 minutes. You'll see the result in your media gallery once complete.",
      prompt,
    });
  } catch (err) {
    return JSON.stringify({
      status: "error",
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
