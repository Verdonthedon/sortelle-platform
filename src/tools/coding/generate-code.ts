export async function generateCode(input: {
  language: string;
  description: string;
  context?: string;
}): Promise<string> {
  return JSON.stringify({
    status: "generated",
    language: input.language,
    description: input.description,
    context: input.context || "none",
  });
}
