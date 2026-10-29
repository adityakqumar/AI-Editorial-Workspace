"use client";

import { SAMPLE_BRIEF } from "@/lib/sampleBrief";
import { SAMPLE_DRAFT, SAMPLE_SOURCES } from "@/lib/sample";
import type {
  AnalyzeResponse,
  FetchedSource,
  ResearchBrief,
  SourceInput,
  StoryAngle,
  WritingIssue,
} from "@/lib/types";
import { useState } from "react";
import { ResearchView } from "./ResearchView";
import { WritingView } from "./WritingView";

function blankSources(): SourceInput[] {
  return [0, 1, 2].map(() => ({ id: crypto.randomUUID(), url: "", pastedText: "" }));
}

function draftFromAngle(angle: StoryAngle, brief: ResearchBrief) {
  const links = angle.evidenceUrls.length
    ? angle.evidenceUrls
    : brief.sources.map((source) => source.sourceUrl);
  return `${angle.headline}

${angle.pitch}

Why now: ${angle.whyNow}

${brief.whatHappened}

${brief.whyItMatters}

${brief.editorNote}

Sources:
${links.map((url) => `- ${url}`).join("\n")}`;
}

export function Workspace() {
  const [tab, setTab] = useState<"research" | "write">("research");
  const [sources, setSources] = useState<SourceInput[]>(blankSources);
  const [researchLoading, setResearchLoading] = useState(false);
  const [researchError, setResearchError] = useState<string | null>(null);
  const [fetched, setFetched] = useState<FetchedSource[] | null>(null);
  const [brief, setBrief] = useState<ResearchBrief | null>(null);

  const [working, setWorking] = useState("");
  const [original, setOriginal] = useState("");
  const [issues, setIssues] = useState<WritingIssue[]>([]);
  const [decisions, setDecisions] = useState<Record<string, "pending" | "accepted" | "rejected">>({});
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [analyzeWarning, setAnalyzeWarning] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<AnalyzeResponse["metrics"] | null>(null);

  async function runResearch() {
    setResearchLoading(true);
    setResearchError(null);
    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sources }),
      });
      const data = await response.json();
      if (!response.ok) {
        setFetched(data.fetched || null);
        throw new Error(data.error || "Research failed.");
      }
      setFetched(data.fetched);
      setBrief(data.brief);
    } catch (error) {
      setResearchError(error instanceof Error ? error.message : "Research failed.");
    } finally {
      setResearchLoading(false);
    }
  }

  async function runAnalyze() {
    setAnalyzeLoading(true);
    setAnalyzeError(null);
    setAnalyzeWarning(null);
    setOriginal(working);
    setDecisions({});
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft: working }),
      });
      const data = (await response.json()) as AnalyzeResponse & { error?: string };
      if (!response.ok) throw new Error(data.error || "Analysis failed.");
      setIssues(data.issues);
      setMetrics(data.metrics);
      setAnalyzeWarning(data.warning || null);
    } catch (error) {
      setAnalyzeError(error instanceof Error ? error.message : "Analysis failed.");
    } finally {
      setAnalyzeLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-rule px-5 py-4 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-ink-soft">This Week in AI</p>
            <h1 className="font-serif text-3xl sm:text-4xl">Copydesk</h1>
            <p className="mt-1 max-w-xl text-sm text-ink-soft">
              An editorial workspace: research a week’s sources, then edit the draft without
              surrendering the meaning.
            </p>
          </div>
          <nav className="flex rounded-full border border-rule p-1">
            <button
              type="button"
              onClick={() => setTab("research")}
              className={`rounded-full px-4 py-1.5 text-sm ${tab === "research" ? "bg-ink text-paper" : ""}`}
            >
              Research
            </button>
            <button
              type="button"
              onClick={() => setTab("write")}
              className={`rounded-full px-4 py-1.5 text-sm ${tab === "write" ? "bg-ink text-paper" : ""}`}
            >
              Write
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        {tab === "research" ? (
          <ResearchView
            sources={sources}
            setSources={setSources}
            loading={researchLoading}
            error={researchError}
            fetched={fetched}
            brief={brief}
            onResearch={runResearch}
            onLoadSample={() =>
              setSources(
                SAMPLE_SOURCES.map((source) => ({
                  id: crypto.randomUUID(),
                  url: source.url,
                  pastedText: source.pastedText,
                })),
              )
            }
            onLoadOfflineBrief={() => {
              setBrief(SAMPLE_BRIEF);
              setFetched(
                SAMPLE_BRIEF.sources.map((source) => ({
                  id: crypto.randomUUID(),
                  url: source.sourceUrl,
                  title: source.sourceTitle,
                  excerpt: "(offline sample brief)",
                  status: "ok" as const,
                  usedPastedText: false,
                  wordCount: 0,
                })),
              );
              setResearchError(
                "Loaded a curated offline brief so you can inspect the workflow without an API key. Generate a live brief when OPENAI_API_KEY is set.",
              );
            }}
            onStartDraft={(angle) => {
              if (!brief) return;
              const next = draftFromAngle(angle, brief);
              setWorking(next);
              setOriginal(next);
              setIssues([]);
              setDecisions({});
              setTab("write");
            }}
          />
        ) : (
          <WritingView
            original={original}
            working={working}
            setWorking={setWorking}
            issues={issues}
            decisions={decisions}
            setDecisions={setDecisions}
            metrics={metrics}
            warning={analyzeWarning}
            loading={analyzeLoading}
            error={analyzeError}
            onAnalyze={runAnalyze}
            onLoadSample={() => {
              setWorking(SAMPLE_DRAFT);
              setOriginal("");
              setIssues([]);
              setDecisions({});
              setMetrics(null);
            }}
            onResetOriginal={() => {
              if (original) setWorking(original);
            }}
          />
        )}
      </main>
    </div>
  );
}
