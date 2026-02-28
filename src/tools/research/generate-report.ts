import { supabaseAdmin } from "@/lib/supabase";

export async function saveResearchReport(
  userId: string,
  sessionId: string | null,
  title: string,
  content: string,
  sources: { url: string; title: string }[]
): Promise<string> {
  const { data, error } = await supabaseAdmin
    .from("research_reports")
    .insert({
      user_id: userId,
      session_id: sessionId,
      title,
      content,
      sources,
    })
    .select("id")
    .single();

  if (error) {
    return JSON.stringify({ error: error.message });
  }

  return JSON.stringify({
    status: "saved",
    reportId: data.id,
    title,
    sourcesCount: sources.length,
  });
}
