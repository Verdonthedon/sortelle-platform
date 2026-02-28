import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest";
import { replicate, VIDEO_MODEL } from "@/lib/replicate";
import { supabaseAdmin } from "@/lib/supabase";

const generateVideo = inngest.createFunction(
  { id: "generate-video", retries: 2 },
  { event: "marketing/video.generate" },
  async ({ event }) => {
    const { prompt, userId, sessionId } = event.data;

    const output = await replicate.run(VIDEO_MODEL, {
      input: { prompt },
    });

    const videoUrl = typeof output === "string" ? output : String(output);

    await supabaseAdmin.from("media_assets").insert({
      user_id: userId,
      session_id: sessionId,
      type: "video",
      url: videoUrl,
      prompt,
      metadata: { model: VIDEO_MODEL },
    });

    return { status: "completed", url: videoUrl };
  }
);

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateVideo],
});
