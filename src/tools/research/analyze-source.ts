export async function analyzeSource(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Sortelle Research Agent/1.0" },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return JSON.stringify({ error: `Failed to fetch: ${res.status}`, url });
    }

    const html = await res.text();

    // Basic HTML to text extraction
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 5000);

    // Extract title
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : url;

    return JSON.stringify({
      url,
      title,
      content: text,
      contentLength: text.length,
    });
  } catch (err) {
    return JSON.stringify({
      error: `Failed to analyze: ${err instanceof Error ? err.message : String(err)}`,
      url,
    });
  }
}
