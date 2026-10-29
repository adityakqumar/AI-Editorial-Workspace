import type { FetchedSource, ResearchBrief } from "./types";

const allowedKinds = new Set(["long-sentence", "passive-voice", "filler", "jargon", "dense-paragraph", "repetition", "clarity"]);

export function allowedSourceUrls(sources: FetchedSource[]) {
  return new Set(sources.map((s) => s.url).filter(Boolean));
}

export function sanitizeBrief(raw: ResearchBrief, sources: FetchedSource[]): ResearchBrief {
  const urls = allowedSourceUrls(sources);
  const titleByUrl = new Map(sources.map((s) => [s.url, s.title]));

  const dropUnknown = <T extends { sourceUrl?: string }>(items: T[] | undefined) =>
    (items || []).filter((item) => !item.sourceUrl || urls.has(item.sourceUrl) || !urls.size);

  return {
    whatHappened: raw.whatHappened || "The model did not produce a clear account of what happened.",
    whyItMatters: raw.whyItMatters || "",
    whoShouldCare: Array.isArray(raw.whoShouldCare) ? raw.whoShouldCare.slice(0, 5) : [],
    sources: (raw.sources || []).map((source) => ({
      ...source,
      sourceTitle: source.sourceTitle || titleByUrl.get(source.sourceUrl) || source.sourceUrl,
      facts: dropUnknown(source.facts).map((fact) => ({
        ...fact,
        sourceTitle: fact.sourceTitle || titleByUrl.get(fact.sourceUrl) || fact.sourceUrl,
      })),
      analysis: dropUnknown(source.analysis),
      speculation: dropUnknown(source.speculation),
    })),
    tensions: raw.tensions || [],
    openQuestions: raw.openQuestions || [],
    angles: (raw.angles || []).map((angle) => ({
      ...angle,
      evidenceUrls: (angle.evidenceUrls || []).filter((url) => urls.has(url) || !urls.size),
    })),
    editorNote: raw.editorNote || "",
  };
}

export function isAllowedIssueKind(kind: string) {
  return allowedKinds.has(kind);
}
