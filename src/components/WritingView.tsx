"use client";

import { computeMetrics } from "@/lib/metrics";
import type { WritingIssue, WritingMetrics } from "@/lib/types";
import { useMemo, useState } from "react";

type Decision = "pending" | "accepted" | "rejected";

type Props = {
  original: string;
  working: string;
  setWorking: (value: string) => void;
  issues: WritingIssue[];
  decisions: Record<string, Decision>;
  setDecisions: (value: Record<string, Decision>) => void;
  metrics: WritingMetrics | null;
  warning: string | null;
  loading: boolean;
  error: string | null;
  onAnalyze: () => void;
  onLoadSample: () => void;
  onResetOriginal: () => void;
};

const KIND_LABEL: Record<WritingIssue["kind"], string> = {
  "long-sentence": "Long sentence",
  "passive-voice": "Passive voice",
  filler: "Filler / Hedging",
  jargon: "Jargon (needs gloss)",
  "dense-paragraph": "Dense paragraph",
  repetition: "Repetition",
  clarity: "Clarity",
};

export function WritingView({
  original,
  working,
  setWorking,
  issues,
  decisions,
  setDecisions,
  metrics,
  warning,
  loading,
  error,
  onAnalyze,
  onLoadSample,
  onResetOriginal,
}: Props) {
  const [compare, setCompare] = useState(false);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [appliedHistory, setAppliedHistory] = useState<
    { id: string; original: string; suggestion: string }[]
  >([]);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const liveMetrics = useMemo(() => computeMetrics(working), [working]);
  const originalMetrics = useMemo(
    () => (original ? computeMetrics(original) : null),
    [original],
  );
  const shown = metrics || liveMetrics;

  const applyIssue = (issue: WritingIssue, decision: Decision) => {
    if (decision === "accepted" && issue.suggestion) {
      if (working.includes(issue.original)) {
        setWorking(working.replace(issue.original, issue.suggestion));
        setAppliedHistory((prev) => [
          ...prev,
          { id: issue.id, original: issue.original, suggestion: issue.suggestion! },
        ]);
      } else {
        const trimmed = issue.original.trim();
        if (working.includes(trimmed)) {
          setWorking(working.replace(trimmed, issue.suggestion.trim()));
          setAppliedHistory((prev) => [
            ...prev,
            { id: issue.id, original: trimmed, suggestion: issue.suggestion!.trim() },
          ]);
        }
      }
    }
    setDecisions({ ...decisions, [issue.id]: decision });
  };

  const undoIssue = (issue: WritingIssue) => {
    const historyItem = appliedHistory.find((h) => h.id === issue.id);
    if (historyItem && working.includes(historyItem.suggestion)) {
      setWorking(working.replace(historyItem.suggestion, historyItem.original));
      setAppliedHistory((prev) => prev.filter((h) => h.id !== issue.id));
    }
    const next = { ...decisions };
    delete next[issue.id];
    setDecisions(next);
  };

  const reconsiderIssue = (issue: WritingIssue) => {
    const next = { ...decisions };
    delete next[issue.id];
    setDecisions(next);
  };

  const handleCopyDraft = () => {
    navigator.clipboard.writeText(working);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const handleDownloadDraft = () => {
    const blob = new Blob([working], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "this-week-in-ai-draft.md";
    link.click();
    URL.revokeObjectURL(url);
  };

  const pending = issues.filter(
    (issue) => (decisions[issue.id] || "pending") === "pending",
  );
  const resolved = issues.filter(
    (issue) => decisions[issue.id] && decisions[issue.id] !== "pending",
  );

  return (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(330px,0.85fr)]">
        <section className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-serif text-2xl">Writing Desk</h2>
              <p className="text-sm text-ink-soft">
                The original is frozen when you run analysis. You decide which suggestions to accept.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCopyDraft}
                className="rounded-full border border-rule px-3 py-1 text-xs hover:bg-paper-2 transition-colors"
              >
                {copyFeedback ? "✓ Copied draft" : "Copy draft"}
              </button>
              <button
                type="button"
                onClick={handleDownloadDraft}
                className="rounded-full border border-rule px-3 py-1 text-xs hover:bg-paper-2 transition-colors"
              >
                Export .md
              </button>
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={compare}
                  onChange={(event) => setCompare(event.target.checked)}
                  className="cursor-pointer"
                />
                Compare original & revised
              </label>
            </div>
          </div>

          {/* Hemingway-style Visual Legend */}
          <div className="flex flex-wrap items-center gap-3 border-y border-rule/60 py-2 text-xs text-ink-soft">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Quality Checks:</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-sm issue-long border border-rule/60"></span>
              Long sentence
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-sm issue-passive border border-rule/60"></span>
              Passive voice
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-sm issue-filler border border-rule/60"></span>
              Filler phrase
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-sm issue-jargon border border-rule/60"></span>
              Jargon (needs gloss)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-sm issue-dense border border-rule/60"></span>
              Dense paragraph
            </span>
          </div>

          {compare ? (
                <div className="space-y-3">
                  {originalMetrics && (
                    <div className="border border-rule bg-white/50 p-3 text-xs leading-5">
                      <p className="font-semibold uppercase tracking-wider text-ink-soft mb-1">
                        Editorial Comparison Summary
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div>
                          <span className="text-ink-soft">Word count: </span>
                          <span className="font-medium">
                            {originalMetrics.wordCount} → {liveMetrics.wordCount} (
                            {liveMetrics.wordCount - originalMetrics.wordCount > 0 ? "+" : ""}
                            {liveMetrics.wordCount - originalMetrics.wordCount})
                          </span>
                        </div>
                        <div>
                          <span className="text-ink-soft">Avg sentence: </span>
                          <span className="font-medium">
                            {originalMetrics.averageSentenceLength} → {liveMetrics.averageSentenceLength}
                          </span>
                        </div>
                        <div>
                          <span className="text-ink-soft">Readability: </span>
                          <span className="font-medium">
                            {originalMetrics.fleschReadingEase} → {liveMetrics.fleschReadingEase}
                          </span>
                        </div>
                        <div>
                          <span className="text-ink-soft">Edits: </span>
                          <span className="font-medium text-emerald-800">
                            {resolved.filter((i) => decisions[i.id] === "accepted").length} accepted
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <div className="mb-1 flex items-center justify-between text-xs uppercase tracking-wide text-ink-soft">
                        <span>Original Frozen Draft</span>
                        <span>{originalMetrics?.wordCount || 0} words</span>
                      </div>
                      <pre className="h-[520px] overflow-auto whitespace-pre-wrap border border-rule bg-paper-2 p-4 text-sm leading-6 font-sans">
                        {original || "Run analysis to freeze an original draft."}
                      </pre>
                    </div>
                    <div>
                      <div className="mb-1 flex items-center justify-between text-xs uppercase tracking-wide text-ink-soft">
                        <span>Revised Working Draft</span>
                        <span>{liveMetrics.wordCount} words</span>
                      </div>
                      <pre className="h-[520px] overflow-auto whitespace-pre-wrap border border-rule bg-white/70 p-4 text-sm leading-6 font-sans">
                        {working}
                      </pre>
                    </div>
                  </div>
                </div>
                ) : (
                <textarea
                  value={working}
                  onChange={(event) => setWorking(event.target.value)}
                  placeholder="Paste a newsletter draft here…"
                  className="h-[520px] w-full resize-y border border-rule bg-white/70 p-4 leading-7 outline-none focus:border-ink transition-colors"
                />
        )}

                {pending.length > 0 && !compare && (
                  <div className="border border-rule bg-white/50 p-4 text-sm leading-7">
                    <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-wide text-ink-soft">
                      <span>Interactive Draft Preview (Passages flagged)</span>
                      <span>Click any highlighted phrase to inspect</span>
                    </div>
                    <HighlightedText
                      text={working}
                      issues={pending}
                      selectedIssueId={selectedIssueId}
                      onSelectIssue={setSelectedIssueId}
                    />
                  </div>
                )}
              </section>

              <aside className="space-y-4">
                <MetricsPanel metrics={shown} />

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={onLoadSample}
                    className="rounded-full border border-rule px-3 py-1.5 text-sm hover:bg-paper-2 transition-colors"
                  >
                    Load sample draft
                  </button>
                  <button
                    type="button"
                    onClick={onResetOriginal}
                    className="rounded-full border border-rule px-3 py-1.5 text-sm hover:bg-paper-2 transition-colors"
                  >
                    Restore original
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={onAnalyze}
                    className="rounded-full bg-ink px-4 py-1.5 text-sm text-paper disabled:opacity-50 hover:opacity-90 transition-opacity"
                  >
                    {loading ? "Reading the draft…" : "Analyze draft"}
                  </button>
                </div>

                {error && <p className="bg-accent-soft px-3 py-2 text-sm border border-accent/40">{error}</p>}
                {warning && (
                  <p className="border border-rule bg-paper-2 px-3 py-2 text-sm leading-5">
                    {warning}
                  </p>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-xl">Actionable Suggestions</h3>
                    {issues.length > 0 && (
                      <span className="text-xs text-ink-soft">
                        {pending.length} pending · {resolved.length} resolved
                      </span>
                    )}
                  </div>

                  {issues.length === 0 && (
                      <p className="text-sm text-ink-soft leading-6 border border-rule/60 bg-white/30 p-4">
                        Click <strong>Analyze draft</strong> to run writing-quality checks and review targeted
                        suggestions. You maintain full editorial control: suggestions are only applied when you accept them.
                      </p>
          )}

                      {pending.map((issue) => (
                        <IssueCard
                          key={issue.id}
                          issue={issue}
                          isSelected={selectedIssueId === issue.id}
                          onSelect={() => setSelectedIssueId(issue.id)}
                          onAccept={() => applyIssue(issue, "accepted")}
                          onReject={() => applyIssue(issue, "rejected")}
                        />
                      ))}

                      {resolved.length > 0 && (
                          <div className="border-t border-rule pt-4 space-y-3">
                            <div className="flex items-center justify-between text-xs uppercase tracking-wide text-ink-soft">
                              <span>Resolved Checks</span>
                              <button
                                type="button"
                                className="underline hover:text-ink"
                                onClick={() => {
                                  setDecisions({});
                                  setAppliedHistory([]);
                                }}
                              >
                                Reset all decisions
                              </button>
                            </div>

                            {resolved.map((issue) => (
                              <article
                                key={issue.id}
                                className="border border-rule/60 bg-paper-2/60 p-2.5 text-xs text-ink-soft flex items-center justify-between gap-3"
                              >
                                <div className="truncate">
                                  <span className="font-semibold uppercase tracking-wider text-[10px]">
                                    {KIND_LABEL[issue.kind]}:
                                  </span>{" "}
                                  <span className="italic">“{issue.original.slice(0, 48)}…”</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  {decisions[issue.id] === "accepted" ? (
                                    <>
                                      <span className="text-emerald-700 font-medium">✓ Accepted</span>
                                      <button
                                        type="button"
                                        onClick={() => undoIssue(issue)}
                                        className="rounded-full border border-rule px-2 py-0.5 text-[11px] hover:bg-white text-ink"
                                      >
                                        Undo
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <span className="text-ink-soft font-medium">Kept original</span>
                                      <button
                                        type="button"
                                        onClick={() => reconsiderIssue(issue)}
                                        className="rounded-full border border-rule px-2 py-0.5 text-[11px] hover:bg-white text-ink"
                                      >
                                        Reconsider
                                      </button>
                                    </>
                                  )}
                                </div>
                              </article>
                            ))}
                          </div>
          )}
                        </div>
      </aside>
    </div>
                );
}

                function MetricsPanel({metrics}: {metrics: WritingMetrics }) {
  const items = [
                {
                label: "Word Count",
                value: String(metrics.wordCount),
                note: "Aim for 300–500 words in a newsletter section. Length is a constraint, not a score.",
    },
                {
                label: "Avg Sentence",
                value: `${metrics.averageSentenceLength} words`,
                note: "A healthy mix of short and longer sentences is better than chasing a uniform average.",
    },
                {
                label: "Reading Time",
                value: `${metrics.readingTimeMinutes} min`,
                note: "Calculated at ~200 wpm. Readers scan on phones: keep the lede high and paragraphs focused.",
    },
                {
                  label: "Readability",
                value: `${metrics.fleschReadingEase} · ${metrics.fleschLabel}`,
                note: metrics.fleschNote,
    },
                ];

                return (
                <div className="grid grid-cols-2 gap-2">
                  {items.map((item) => (
                    <div key={item.label} className="border border-rule bg-white/50 p-3">
                      <p className="text-xs uppercase tracking-wide text-ink-soft">{item.label}</p>
                      <p className="font-serif text-xl">{item.value}</p>
                      <p className="mt-1 text-[11px] leading-4 text-ink-soft">{item.note}</p>
                    </div>
                  ))}
                </div>
                );
}

                function IssueCard({
                  issue,
                  isSelected,
                  onSelect,
                  onAccept,
                  onReject,
}: {
                  issue: WritingIssue;
                isSelected?: boolean;
  onSelect: () => void;
  onAccept: () => void;
  onReject: () => void;
}) {
  return (
                    <article
                      onClick={onSelect}
                      className={`border p-3.5 transition-all cursor-pointer ${isSelected
                          ? "border-ink bg-white shadow-sm ring-1 ring-ink/20"
                          : "border-rule bg-white/70 hover:border-ink/50"
                        }`}
                    >
                      <div className="flex items-center justify-between text-xs uppercase tracking-wide text-ink-soft">
                        <span className="font-semibold text-ink">{KIND_LABEL[issue.kind]}</span>
                        <span className="rounded bg-paper-2 px-1.5 py-0.5 text-[10px]">
                          {issue.source === "rule" ? "Rule check" : "Model review"}
                        </span>
                      </div>

                      <p className="mt-2 text-sm italic leading-6 text-ink/90 border-l-2 border-rule pl-2.5">
                        “{issue.original}”
                      </p>

                      <p className="mt-2 text-sm leading-6">{issue.explanation}</p>
                      <p className="mt-1 text-xs text-ink-soft leading-5 italic">{issue.whyItMatters}</p>

                      {issue.suggestion && (
        <div className="mt-2.5 rounded bg-emerald-50/70 border border-emerald-200/80 p-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800">
            Suggested Improvement:
          </p>
          <p className="mt-0.5 text-sm leading-6 text-emerald-950 font-medium">
            {issue.suggestion}
          </p>
        </div>
                      )}

                        <div className="mt-3 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            disabled={!issue.suggestion}
                            onClick={onAccept}
                            className="rounded-full bg-ink px-3 py-1 text-xs text-paper disabled:opacity-40 hover:opacity-90 transition-opacity"
                          >
                            Accept rewrite
                          </button>
                          <button
                            type="button"
                            onClick={onReject}
                            className="rounded-full border border-rule px-3 py-1 text-xs hover:bg-paper-2 transition-colors"
                          >
                            Keep original
                          </button>
                        </div>
                    </article>
                    );
}

                      function HighlightedText({
                        text,
                        issues,
                        selectedIssueId,
                        onSelectIssue,
                      }: {
                        text: string;
                        issues: WritingIssue[];
                        selectedIssueId: string | null;
                        onSelectIssue: (id: string) => void;
                      }) {
                        const unique = [
                          ...new Map(issues.map((issue) => [issue.original, issue])).values(),
  ].slice(0, 10);
  const sorted = [...unique].sort((a, b) => b.original.length - a.original.length);

                    type Piece = {text: string; issue?: WritingIssue };
                    let pieces: Piece[] = [{text}];

                    for (const issue of sorted) {
    const next: Piece[] = [];
                    for (const piece of pieces) {
      if (piece.issue || !piece.text.includes(issue.original)) {
                      next.push(piece);
                    continue;
      }
                    const parts = piece.text.split(issue.original);
      parts.forEach((part, index) => {
        if (part) next.push({text: part });
                    if (index < parts.length - 1) next.push({text: issue.original, issue });
      });
    }
                    pieces = next;
  }

                    return (
                      <p className="leading-7">
                        {pieces.map((piece, index) =>
                              piece.issue ? (
                              <mark
                                key={index}
                                onClick={() => onSelectIssue(piece.issue!.id)}
                                className={`cursor-pointer rounded-xs px-0.5 issue-${piece.issue.kind.split("-")[0]} ${selectedIssueId === piece.issue.id ? "ring-2 ring-ink ring-offset-1 font-medium" : ""
                                  }`}
                                title={`${KIND_LABEL[piece.issue.kind]}: click to view suggestion`}
                              >
                                {piece.text}
                              </mark>
                              ) : (
                              <span key={index}>{piece.text}</span>
                              ),
      )}
                            </p>
                          );
}
