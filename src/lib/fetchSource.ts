import * as cheerio from "cheerio";

const MAX_CHARS = 9000;
const FETCH_TIMEOUT_MS = 12000;

function collapseWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function extractMainText($: cheerio.CheerioAPI) {
  $("script, style, noscript, nav, footer, header, iframe, svg, form").remove();

  const candidates = [
    "article",
    "[role='main']",
    "main",
    ".post-content",
    ".article-content",
    ".entry-content",
    "#content",
  ];

  for (const selector of candidates) {
    const text = collapseWhitespace($(selector).first().text());
    if (text.length > 400) return text;
  }

  const paragraphs = $("p")
    .map((_, el) => collapseWhitespace($(el).text()))
    .get()
    .filter((p) => p.length > 40);

  if (paragraphs.length) return paragraphs.join("\n\n");
  return collapseWhitespace($("body").text());
}

export async function fetchSource(url: string, pastedText: string) {
  const fallback = collapseWhitespace(pastedText);
  if (!url && fallback) {
    return {
      title: fallback.slice(0, 80) || "Pasted source",
      excerpt: fallback.slice(0, MAX_CHARS),
      status: "ok" as const,
      usedPastedText: true,
      wordCount: fallback.split(/\s+/).filter(Boolean).length,
    };
  }

  if (!url) {
    return {
      title: "Untitled source",
      excerpt: "",
      status: "failed" as const,
      error: "No URL or pasted text provided.",
      usedPastedText: false,
      wordCount: 0,
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; CopydeskBot/0.1; +https://thisweekin.ai)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      if (fallback) {
        return {
          title: url,
          excerpt: fallback.slice(0, MAX_CHARS),
          status: "partial" as const,
          error: `Fetch returned ${response.status}. Using pasted text.`,
          usedPastedText: true,
          wordCount: fallback.split(/\s+/).filter(Boolean).length,
        };
      }
      return {
        title: url,
        excerpt: "",
        status: "failed" as const,
        error: `Could not fetch URL (${response.status}). Paste the article text instead.`,
        usedPastedText: false,
        wordCount: 0,
      };
    }

    const contentType = response.headers.get("content-type") || "";
    const raw = await response.text();
    let title = url;
    let excerpt = "";

    if (contentType.includes("text/html") || raw.trim().startsWith("<")) {
      const $ = cheerio.load(raw);
      title =
        collapseWhitespace($("meta[property='og:title']").attr("content") || "") ||
        collapseWhitespace($("title").first().text()) ||
        url;
      excerpt = extractMainText($);
    } else {
      excerpt = collapseWhitespace(raw);
      title = url;
    }

    if (excerpt.length < 200 && fallback) {
      excerpt = `${excerpt}\n\n${fallback}`.trim();
      return {
        title,
        excerpt: excerpt.slice(0, MAX_CHARS),
        status: "partial" as const,
        error: "Page had little extractable text. Combined with pasted notes.",
        usedPastedText: true,
        wordCount: excerpt.split(/\s+/).filter(Boolean).length,
      };
    }

    if (excerpt.length < 80) {
      if (fallback) {
        return {
          title,
          excerpt: fallback.slice(0, MAX_CHARS),
          status: "partial" as const,
          error: "Could not extract article body. Using pasted text.",
          usedPastedText: true,
          wordCount: fallback.split(/\s+/).filter(Boolean).length,
        };
      }
      return {
        title,
        excerpt: excerpt.slice(0, MAX_CHARS),
        status: "failed" as const,
        error:
          "The page blocked extraction or had no readable article body. Paste the text.",
        usedPastedText: false,
        wordCount: excerpt.split(/\s+/).filter(Boolean).length,
      };
    }

    return {
      title,
      excerpt: excerpt.slice(0, MAX_CHARS),
      status: "ok" as const,
      usedPastedText: false,
      wordCount: excerpt.split(/\s+/).filter(Boolean).length,
    };
  } catch (error) {
    const message =
      error instanceof Error && error.name === "AbortError"
        ? "Timed out fetching the URL."
        : error instanceof Error
          ? error.message
          : "Unknown fetch error.";

    if (fallback) {
      return {
        title: url,
        excerpt: fallback.slice(0, MAX_CHARS),
        status: "partial" as const,
        error: `${message} Using pasted text.`,
        usedPastedText: true,
        wordCount: fallback.split(/\s+/).filter(Boolean).length,
      };
    }

    return {
      title: url,
      excerpt: "",
      status: "failed" as const,
      error: `${message} Paste the article or tweet text to continue.`,
      usedPastedText: false,
      wordCount: 0,
    };
  } finally {
    clearTimeout(timer);
  }
}
