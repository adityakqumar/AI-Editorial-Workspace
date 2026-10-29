"use client";

import { useState } from "react";
import type { FetchedSource, ResearchBrief, SourceInput, StoryAngle } from "@/lib/types";

type Props = {
  sources: SourceInput[];
  setSources: (sources: SourceInput[]) => void;
  loading: boolean;
  error: string | null;
  fetched: FetchedSource[] | null;
  brief: ResearchBrief | null;
  onResearch: () => void;
  onLoadSample: () => void;
  onLoadOfflineBrief: () => void;
  onStartDraft: (angle: StoryAngle) => void;
};

function emptySource(): SourceInput {
  return { id: crypto.randomUUID(), url: "", pastedText: "" };
}

export function ResearchView({
  sources,
  setSources,
  loading,
  error,
  fetched,
  brief,
  onResearch,
  onLoadSample,
  onLoadOfflineBrief,
  onStartDraft,
}: Props) {
  const update = (id: string, patch: Partial<SourceInput>) => {
    setSources(sources.map((source) => (source.id === id ? { ...source, ...patch } : source)));
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)]">
      <section className="space-y-4">
        <div>
          <h2 className="font-serif text-2xl">Sources</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Add at least three URLs, tweets, or pasted excerpts. If a site blocks fetching, paste
            the text beside it.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onLoadSample}
            className="rounded-full border border-rule px-3 py-1.5 text-sm hover:bg-paper-2"
          >
            Load October sample URLs
          </button>
          <button
            type="button"
            onClick={onLoadOfflineBrief}
            className="rounded-full border border-rule px-3 py-1.5 text-sm hover:bg-paper-2"
          >
            Use offline brief
          </button>
        </div>

        <div className="space-y-4">
          {sources.map((source, index) => (
            <article key={source.id} className="border border-rule bg-white/50 p-4">
              <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-wide text-ink-soft">
                <span>Source {index + 1}</span>
                {sources.length > 3 && (
                  <button
                    type="button"
                    className="text-accent"
                    onClick={() => setSources(sources.filter((item) => item.id !== source.id))}
                  >
                    Remove
                  </button>
                )}
              </div>
              <input
                value={source.url}
                onChange={(event) => update(source.id, { url: event.target.value })}
                placeholder="https:// or leave blank if pasting only"
                className="mb-2 w-full border border-rule bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
              />
              <textarea
                value={source.pastedText}
                onChange={(event) => update(source.id, { pastedText: event.target.value })}
                placeholder="Optional: paste article or tweet text"
                rows={4}
                className="w-full resize-y border border-rule bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
              />
            </article>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setSources([...sources, emptySource()])}
            className="rounded-full border border-rule px-4 py-2 text-sm"
          >
            Add source
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onResearch}
            className="rounded-full bg-ink px-5 py-2 text-sm text-paper disabled:opacity-50"
          >
            {loading ? "Reading sources…" : "Build research brief"}
          </button>
        </div>

        {error && (
          <p className="border border-accent/40 bg-accent-soft px-3 py-2 text-sm">{error}</p>
        )}

        {fetched && (
          <div className="space-y-2 text-sm">
            <h3 className="text-xs uppercase tracking-wide text-ink-soft">Fetch status</h3>
            {fetched.map((source) => (
              <div key={source.id} className="flex items-start justify-between gap-3 border-b border-rule/70 py-2">
                <div>
                  <p className="font-medium">{source.title}</p>
                  <p className="text-ink-soft">
                    {source.status}
                    {source.error ? ` — ${source.error}` : ""} · {source.wordCount} words
                  </p>
                </div>
                {source.url && (
                  <a className="shrink-0 text-accent underline" href={source.url} target="_blank">
                    Open
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="min-h-[70vh] border border-rule bg-white/40 p-5 lg:p-7">
        {!brief ? (
          <div className="flex h-full min-h-[40vh] flex-col justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">The brief</p>
              <h2 className="mt-3 font-serif text-3xl leading-tight">
                Find a story worth telling, then defend it with sources.
              </h2>
              <p className="mt-4 max-w-md text-ink-soft">
                The brief answers what happened, why it matters, who should care, and which claims
                are facts versus speculation. Summaries are a means, not the product.
              </p>
            </div>
            <p className="text-sm italic text-ink-soft">
              Tip: if a lab blog blocks the fetch, paste two or three key paragraphs. The model
              should not invent the rest.
            </p>
          </div>
        ) : (
          <BriefDocument brief={brief} onStartDraft={onStartDraft} />
        )}
      </section>
    </div>
  );
}

function briefToMarkdown(brief: ResearchBrief): string {
  let md = `# Research Brief\n\n## What Happened\n${brief.whatHappened}\n\n## Why It Matters\n${brief.whyItMatters}\n\n## Who Should Care\n`;
  brief.whoShouldCare.forEach((w) => {
    md += `- **${w.audience}**: ${w.why}\n`;
  });
  if (brief.tensions?.length) {
    md += `\n## Tensions\n`;
    brief.tensions.forEach((t) => {
      md += `- ${t}\n`;
    });
  }
  md += `\n## Evidence by Source\n`;
  brief.sources.forEach((s) => {
    md += `\n### [${s.sourceTitle}](${s.sourceUrl})\n${s.whatHappened}\n*Why it matters: ${s.whyItMatters}*\n`;
    if (s.facts?.length) {
      md += `\n**Verified Facts:**\n`;
      s.facts.forEach((f) => {
        md += `- ${f.claim} *(Evidence: ${f.evidence})*\n`;
      });
    }
    if (s.analysis?.length) {
      md += `\n**Analysis:**\n`;
      s.analysis.forEach((a) => {
        md += `- ${a.claim} *(${a.whyUnverified})*\n`;
      });
    }
    if (s.speculation?.length) {
      md += `\n**Speculation:**\n`;
      s.speculation.forEach((sp) => {
        md += `- ${sp.claim} *(${sp.whyUnverified})*\n`;
      });
    }
  });
  md += `\n## Newsletter Angles\n`;
  brief.angles.forEach((a) => {
    md += `\n### ${a.headline}\n${a.pitch}\n*Why now:* ${a.whyNow}\n`;
  });
  if (brief.openQuestions?.length) {
    md += `\n## Open Questions\n`;
    brief.openQuestions.forEach((q) => {
      md += `- ${q}\n`;
    });
  }
  if (brief.editorNote) {
    md += `\n## Editor's Caution\n${brief.editorNote}\n`;
  }
  return md;
}

function BriefDocument({
  brief,
  onStartDraft,
}: {
  brief: ResearchBrief;
  onStartDraft: (angle: StoryAngle) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(briefToMarkdown(brief));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className="space-y-8">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-rule pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">Research brief</p>
            <h2 className="mt-2 font-serif text-3xl leading-tight">What happened</h2>
            <p className="mt-3 text-[1.05rem] leading-7">{brief.whatHappened}</p>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="shrink-0 rounded-full border border-rule px-3 py-1.5 text-xs hover:bg-paper-2 transition-colors"
          >
            {copied ? "✓ Copied to clipboard" : "Copy brief as Markdown"}
          </button>
        </header>

        <section>
          <h3 className="font-serif text-2xl">Why it matters</h3>
          <p className="mt-2 leading-7">{brief.whyItMatters}</p>
        </section>

        <section>
          <h3 className="font-serif text-2xl">Who should care</h3>
          <ul className="mt-3 space-y-3">
            {brief.whoShouldCare.map((item) => (
              <li key={item.audience} className="border-l-2 border-accent pl-3">
                <p className="font-medium">{item.audience}</p>
                <p className="text-sm text-ink-soft">{item.why}</p>
              </li>
            ))}
          </ul>
        </section>

        {brief.tensions.length > 0 && (
          <section>
            <h3 className="font-serif text-2xl">Tensions</h3>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6">
              {brief.tensions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        <section className="space-y-6">
          <h3 className="font-serif text-2xl">Evidence by source</h3>
          {brief.sources.map((source) => (
            <div key={source.sourceUrl} className="border-t border-rule pt-4">
              <a href={source.sourceUrl} className="text-accent underline" target="_blank">
                {source.sourceTitle}
              </a>
              <p className="mt-2 text-sm leading-6">{source.whatHappened}</p>
              <p className="mt-1 text-sm italic text-ink-soft">{source.whyItMatters}</p>
              <ClaimList title="Facts" tone="fact" items={source.facts.map((f) => f.claim)} />
              <ClaimList
                title="Analysis"
                tone="analysis"
                items={source.analysis.map((f) => `${f.claim} (${f.whyUnverified})`)}
              />
              <ClaimList
                title="Speculation"
                tone="speculation"
                items={source.speculation.map((f) => `${f.claim} (${f.whyUnverified})`)}
              />
              <ul className="mt-2 space-y-1 text-xs text-ink-soft">
                {source.facts.map((fact) => (
                  <li key={fact.claim}>
                    Evidence: {fact.evidence} —{" "}
                    <a className="underline" href={fact.sourceUrl} target="_blank">
                      {fact.sourceTitle}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section>
          <h3 className="font-serif text-2xl">Possible newsletter angles</h3>
          <div className="mt-4 space-y-4">
            {brief.angles.map((angle) => (
              <div key={angle.headline} className="border border-rule bg-paper p-4">
                <h4 className="font-serif text-xl">{angle.headline}</h4>
                <p className="mt-2 text-sm leading-6">{angle.pitch}</p>
                <p className="mt-2 text-sm text-ink-soft">Why now: {angle.whyNow}</p>
                <button
                  type="button"
                  onClick={() => onStartDraft(angle)}
                  className="mt-3 rounded-full bg-accent px-4 py-1.5 text-sm text-paper"
                >
                  Draft from this angle
                </button>
              </div>
            ))}
          </div>
        </section>

        {brief.openQuestions.length > 0 && (
          <section>
            <h3 className="font-serif text-2xl">Open questions</h3>
            <ul className="mt-2 list-disc pl-5 text-sm leading-6">
              {brief.openQuestions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {brief.editorNote && (
          <aside className="border border-highlight bg-highlight/40 p-4 text-sm leading-6">
            <p className="text-xs uppercase tracking-wide">Editor’s caution</p>
            <p className="mt-1">{brief.editorNote}</p>
          </aside>
        )}
    </article>
  );
}

function ClaimList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "fact" | "analysis" | "speculation";
}) {
  if (!items.length) return null;
  const styles =
    tone === "fact"
      ? {
        badge: "bg-emerald-100 text-emerald-900 border-emerald-300",
        border: "border-l-emerald-600",
        title: `Verified Facts (${title})`,
      }
      : tone === "analysis"
        ? {
          badge: "bg-amber-100 text-amber-900 border-amber-300",
          border: "border-l-amber-600",
          title: `Analysis / Interpretation (${title})`,
        }
        : {
          badge: "bg-purple-100 text-purple-900 border-purple-300",
          border: "border-l-purple-600",
          title: `Speculation / Unverified (${title})`,
        };

  return (
        <div className={`mt-3 border-l-2 ${styles.border} pl-3 py-1`}>
          <span
            className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${styles.badge}`}
          >
            {styles.title}
          </span>
          <ul className="mt-1 list-disc space-y-1 pl-4 text-sm leading-6">
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        );
}
