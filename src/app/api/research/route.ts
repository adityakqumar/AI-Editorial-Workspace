import { fetchSource } from "@/lib/fetchSource";
import { LlmConfigError, completeJson } from "@/lib/llm";
import { researchSystemPrompt, researchUserPrompt } from "@/lib/prompts";
import type { FetchedSource, ResearchBrief, SourceInput } from "@/lib/types";
import { sanitizeBrief } from "@/lib/validateBrief";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { sources?: SourceInput[] };
    const inputs = (body.sources || [])
      .map((source) => ({
        id: source.id || crypto.randomUUID(),
        url: source.url?.trim() || "",
        pastedText: source.pastedText?.trim() || "",
      }))
      .filter((source) => source.url || source.pastedText);

    if (inputs.length < 3) {
      return Response.json(
        { error: "Add at least three sources (URLs, pasted articles, or tweets)." },
        { status: 400 },
      );
    }

    const fetched: FetchedSource[] = await Promise.all(
      inputs.map(async (input) => {
        const result = await fetchSource(input.url, input.pastedText);
        return {
          id: input.id,
          url: input.url,
          title: result.title,
          excerpt: result.excerpt,
          status: result.status,
          error: result.error,
          usedPastedText: result.usedPastedText,
          wordCount: result.wordCount,
        };
      }),
    );

    const readable = fetched.filter((source) => source.excerpt.length > 80);
    if (readable.length === 0) {
      return Response.json(
        {
          error:
            "None of the sources could be read. Paste article text next to any URL that blocks scraping.",
          fetched,
        },
        { status: 422 },
      );
    }

    const brief = await completeJson<ResearchBrief>([
      { role: "system", content: researchSystemPrompt() },
      { role: "user", content: researchUserPrompt(fetched) },
    ]);

    return Response.json({
      fetched,
      brief: sanitizeBrief(brief, fetched),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Research failed.";
    const status = error instanceof LlmConfigError ? 503 : 500;
    return Response.json({ error: message }, { status });
  }
}
