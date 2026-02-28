import { replicate, IMAGE_MODEL } from "@/lib/replicate";
import { supabaseAdmin } from "@/lib/supabase";

export async function generateImage(
  prompt: string,
  userId: string,
  sessionId: string | null,
  aspectRatio: string = "1:1"
): Promise<string> {
  try {
    const output = await replicate.run(IMAGE_MODEL, {
      input: {
        prompt,
        aspect_ratio: aspectRatio,
        output_format: "webp",
        output_quality: 90,
        safety_tolerance: 2,
      },
    });

    // Replicate returns a URL or FileOutput
    const imageUrl = typeof output === "string" ? output : String(output);

    // Save to media assets
    await supabaseAdmin.from("media_assets").insert({
      user_id: userId,
      session_id: sessionId,
      type: "image",
      url: imageUrl,
      prompt,
      metadata: { aspect_ratio: aspectRatio, model: IMAGE_MODEL },
    });

    return JSON.stringify({
      status: "completed",
      url: imageUrl,
      prompt,
      aspectRatio,
    });
  } catch (err) {
    return JSON.stringify({
      status: "error",
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
