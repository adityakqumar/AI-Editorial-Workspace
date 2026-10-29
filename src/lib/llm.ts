type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export class LlmConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LlmConfigError";
  }
}

export function getLlmConfig() {
    const openAiKey = process.env.OPENAI_API_KEY?.trim();
    const geminiKey = process.env.GEMINI_API_KEY?.trim();

    if (openAiKey) {
      return {
        apiKey: openAiKey,
        model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
        baseUrl: (process.env.OPENAI_BASE_URL?.trim() || "https://api.openai.com/v1").replace(
          /\/$/,
          "",
        ),
        provider: "OpenAI",
      };
    }

    if (geminiKey) {
      return {
        apiKey: geminiKey,
        model: process.env.GEMINI_MODEL?.trim() || "gemini-1.5-flash",
        baseUrl: (
          process.env.GEMINI_BASE_URL?.trim() ||
          "https://generativelanguage.googleapis.com/v1beta/openai"
        ).replace(/\/$/, ""),
        provider: "Gemini",
      };
    }

    throw new LlmConfigError(
      "Neither OPENAI_API_KEY nor GEMINI_API_KEY was found in environment. Add one to .env.local for live research briefs and model-powered rewrite suggestions.",
    );
  }

  function extractJson(text: string) {
    const trimmed = text.trim();
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
    const candidate = fenced ? fenced[1] : trimmed;
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start === -1 || end === -1) {
      throw new Error("Model did not return JSON.");
    }
    return JSON.parse(candidate.slice(start, end + 1));
  }

  export async function completeJson<T>(messages: ChatMessage[]): Promise<T> {
    const { apiKey, model, baseUrl } = getLlmConfig();

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`LLM request failed (${response.status}): ${detail.slice(0, 400)}`);
    }

    const payload = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) throw new Error("LLM returned an empty response.");
    return extractJson(content) as T;
  }
