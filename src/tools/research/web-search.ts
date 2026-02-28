export async function webSearch(query: string, count: number = 5): Promise<string> {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!apiKey) {
    return JSON.stringify({ error: "Brave Search API key not configured" });
  }

  const params = new URLSearchParams({
    q: query,
    count: String(count),
  });

  const res = await fetch(`https://api.search.brave.com/res/v1/web/search?${params}`, {
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip",
      "X-Subscription-Token": apiKey,
    },
  });

  if (!res.ok) {
    return JSON.stringify({ error: `Search failed: ${res.status}` });
  }

  const data = await res.json();
  const results = (data.web?.results || []).map(
    (r: { title: string; url: string; description: string }) => ({
      title: r.title,
      url: r.url,
      description: r.description,
    })
  );

  return JSON.stringify({ query, results, totalResults: results.length });
}
