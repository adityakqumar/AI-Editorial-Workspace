export type SourceInput = {
  id: string;
  url: string;
  pastedText: string;
};

export type FetchedSource = {
  id: string;
  url: string;
  title: string;
  excerpt: string;
  status: "ok" | "partial" | "failed";
  error?: string;
  usedPastedText: boolean;
  wordCount: number;
};

export type AudienceNote = {
  audience: string;
  why: string;
};

export type EvidencedClaim = {
  claim: string;
  evidence: string;
  sourceUrl: string;
  sourceTitle: string;
};

export type UnverifiedClaim = {
  claim: string;
  whyUnverified: string;
  sourceUrl?: string;
};

export type SourceBrief = {
  sourceUrl: string;
  sourceTitle: string;
  whatHappened: string;
  whyItMatters: string;
  facts: EvidencedClaim[];
  analysis: UnverifiedClaim[];
  speculation: UnverifiedClaim[];
};

export type StoryAngle = {
  headline: string;
  pitch: string;
  whyNow: string;
  evidenceUrls: string[];
};

export type ResearchBrief = {
  whatHappened: string;
  whyItMatters: string;
  whoShouldCare: AudienceNote[];
  sources: SourceBrief[];
  tensions: string[];
  openQuestions: string[];
  angles: StoryAngle[];
  editorNote: string;
};

export type WritingIssueKind =
  | "long-sentence"
  | "passive-voice"
  | "filler"
  | "jargon"
  | "dense-paragraph"
  | "repetition"
  | "clarity";

export type WritingIssue = {
  id: string;
  kind: WritingIssueKind;
  source: "rule" | "model";
  original: string;
  suggestion: string | null;
  explanation: string;
  whyItMatters: string;
};

export type WritingMetrics = {
  wordCount: number;
  sentenceCount: number;
  paragraphCount: number;
  averageSentenceLength: number;
  readingTimeMinutes: number;
  fleschReadingEase: number;
  fleschLabel: string;
  fleschNote: string;
};

export type AnalyzeResponse = {
  metrics: WritingMetrics;
  issues: WritingIssue[];
  modelUsed: boolean;
  warning?: string;
};
