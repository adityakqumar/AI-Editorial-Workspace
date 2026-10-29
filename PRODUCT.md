# Product and Engineering Note: Copydesk

> **Workspace:** AI Editorial Desk for *This Week in AI*  
> **Role:** Forward Deployed Engineer Intern  
> **Focus:** Discovery over summarization; editorial judgment over mechanical rewriting.

---

## 1. Product Thinking

### Primary User
The primary user is a **newsletter editor at *This Week in AI***. 

This editor does not suffer from a lack of information; they suffer from an uncurated flood of primary sources — arXiv preprints, corporate blog posts, engineering launch notes, and social media debates. Their job is not merely to write, but to produce a 300–500 word weekly briefing for founders, engineering builders, and business operators who need to know:
1. What happened?
2. Why does it matter on Monday morning?
3. Which claims are verified facts versus vendor marketing and speculative commentary?

### The Most Important Problem
**Discovery with evidence, not generic summarization.**

Every existing AI tool offers summarization, but summaries are a commodity. An executive summary that condenses three 2,000-word blog posts into three 200-word summaries leaves the editor with the exact same problem: *Is there actually a story here? What is the conflict? What claims can we legally and reputationally stand behind?*

The critical bottlenecks in the editorial pipeline are:
- Distinguishing verified empirical data (benchmarks, pricing tables, GA release dates) from corporate positioning and forward-looking speculation.
- Synthesizing cross-source tensions (e.g. OpenAI and Anthropic competing on volume and subagent pricing, while Google gates frontier cyber capability).
- Refining prose without flattening the author's voice or stripping critical technical constraints.

### Core Workflow
The application bridges two distinct phases of editorial work as "two rooms on the same floor":

```
[Raw Sources] 
  (3+ URLs, tweets, or pasted text)
       │
       ▼
[Research Assistant] 
  - Extraction & Resilient Fallbacks
  - Facts vs. Analysis vs. Speculation Breakdown
  - Cross-Source Tensions & Open Questions
  - 2–3 Differentiated Story Angles
       │
       ▼ (One-Click Handoff: "Draft from this angle")
[Writing Assistant]
  - Interactive Hemingway-style Visual Preview
  - Deterministic Checks (Passive, Long Sentences, Jargon, Filler, Density)
  - Nuanced Model Rewrites & Glosses
  - Writer-in-Control Decision Desk (Accept / Reject / Undo)
  - Side-by-Side Comparison & Delta Metrics
       │
       ▼
[Final Editorial Piece] (Filed 300–500 word briefing)
```

### Prioritization & Deliberate Omissions

| Prioritized Capabilities | Why Prioritized |
| :--- | :--- |
| **Resilient multi-source ingestion with text fallback** | Real-world lab blogs frequently block headless scrapers or render dynamic client-side shells. An editor cannot afford a hard failure. |
| **Fact vs. Analysis vs. Speculation classification** | Editorial credibility hinges on separating what vendor benchmark tables prove from what vendor PR claims. |
| **Strict URL-grounded citation filtering** | Dropping any model citation that points to an unprovided URL prevents hallucinated references. |
| **Deterministic + LLM hybrid writing checks** | Fast, repeatable rule-based checks highlight mechanical issues instantly; LLMs provide context-aware rewrite alternatives. |
| **Writer-in-Control with Undo & Delta Comparison** | Software must propose while the human disposes. Authors need to revert changes and see quantitative before/after metrics. |
| **Offline Evaluation Mode** | Reviewers and editors can test the entire workflow with sample data without requiring pre-configured API keys. |

**Deliberately left out:**
- *Full CMS / Substack publishing integration:* Publishing APIs do not improve editorial quality.
- *User authentication & team workspaces:* Distracts from solving the core editorial problem within the 6–8 hour scope.
- *Auto-applying rewrites:* Automated "clean up" algorithms inevitably flatten nuanced technical arguments into bland corporate prose.
- *Scraping engines that bypass authenticated social media paywalls:* Brittle and ethically problematic; replaced by honest fallback to pasted excerpts.

### Measuring Product Utility
If deployed to a real editorial newsroom, I would measure utility using these four metrics:
1. **Time-to-Validated-Angle:** The number of minutes from source ingestion to an editor selecting and keeping a generated story angle.
2. **Fact Survival Rate:** The percentage of claims categorized as "Verified Facts" by the assistant that survive final human fact-checking into the published newsletter (target: >95%).
3. **Acceptance vs. Reversion Rate:** In the writing desk, tracking the ratio of accepted rewrites that are subsequently manually reverted. A high acceptance rate paired with high manual reversion indicates the model is smoothing away the author's voice.
4. **Citation Grounding Integrity:** The percentage of outbound links in the final newsletter that directly trace back to the research brief's source table.

---

## 2. Engineering Architecture

### Application Structure
The application is built on **Next.js 16 (App Router)** with **React 19** and **Tailwind CSS 4**:

- **Client Layer (`src/components/`):**
  - `Workspace.tsx`: Central coordinator managing active desk tabs (`research` vs `write`), draft state, brief handoff, and cross-tab data flow.
  - `ResearchView.tsx`: Multi-source input desk, status monitors, structured brief viewer, fact/analysis chips, and Markdown export.
  - `WritingView.tsx`: Interactive Hemingway-style text preview, color-coded highlights, metric cards, accept/reject/undo decision stream, and side-by-side diff comparison.
- **Server API Layer (`src/app/api/`):**
  - `POST /api/research`: Orchestrates parallel URL fetching, content extraction, LLM prompt execution, and schema sanitization.
  - `POST /api/analyze`: Executes deterministic heuristic checks in parallel with LLM rewrite suggestion models, merging both streams into an actionable issue array.
- **Domain & Utility Libraries (`src/lib/`):**
  - `fetchSource.ts`: Cheerio-based DOM scraper with 12s timeout controller and text paste fallback.
  - `writingChecks.ts`: Deterministic regex rules for long sentences, passives, filler phrases, unglossed technical jargon, and dense walls of text.
  - `metrics.ts`: Word count, sentence counts, average sentence length, reading time, and Flesch Reading Ease score computation.
  - `validateBrief.ts`: URL allowlist validator stripping hallucinated sources.
  - `llm.ts`: Multi-provider client supporting both OpenAI and Google Gemini OpenAI-compatible endpoints with strict JSON completion.

### AI vs. Deterministic Logic Split

```
┌─────────────────────────────────┬─────────────────────────────────┐
│     DETERMINISTIC LOGIC         │           AI / LLM              │
├─────────────────────────────────┼─────────────────────────────────┤
│ • HTML extraction & cleanup     │ • Narrative synthesis of events │
│ • Network timeout handling      │ • "Why it matters" formulation  │
│ • Word / syllable / metrics     │ • Cross-source tension mapping  │
│ • Long sentence detection       │ • Angle ideation (3 variants)   │
│ • Passive voice identification  │ • Contextual rewrite suggestions│
│ • Filler phrase regex matching  │ • Technical jargon glossing     │
│ • Unglossed jargon flagging     │                                 │
│ • URL citation allowlisting     │                                 │
│ • Text replacement & undo logic │                                 │
└─────────────────────────────────┴─────────────────────────────────┘
```

### Handling Unreliable Scrapes, Missing Content & Failed Requests
1. **Network Timeouts & Extraction Blocks:** Requests time out strictly after 12 seconds via an `AbortController`. If a site returns an HTTP 403, 429, or empty JavaScript shell, `fetchSource` downgrades the status to `partial` (if the editor provided pasted text) or `failed` with an explicit prompt: *"The page blocked extraction. Paste the article text beside the URL."*
2. **Missing LLM Credentials:** If neither `OPENAI_API_KEY` nor `GEMINI_API_KEY` is present, API routes throw a typed `LlmConfigError`. The Writing Desk catches this and still delivers all deterministic quality checks and metrics, alongside a non-blocking UI alert.
3. **Mangled Model Outputs:** System prompts enforce valid JSON with explicit schema definitions. `extractJson` strips Markdown formatting blocks and searches for the bounding `{` and `}` braces to ensure parse safety.

### Ensuring Source Grounding
Models frequently hallucinate plausible-looking URLs. Copydesk prevents this at two levels:
1. **Prompt Constraint:** The system prompt instructs the model: *"Every fact.sourceUrl must be one of the provided URLs. Do not invent numbers, quotes, or product names."*
2. **Server-Side Allowlisting (`validateBrief.ts`):** `sanitizeBrief` constructs a Set of all URLs supplied by the user. Any claim, fact, or angle generated by the model whose `sourceUrl` or `evidenceUrls` does not exist in the allowed set is programmatically purged before reaching the client.

### What I Would Improve With Another Day of Work
1. **Quote-Level Text Anchoring:** Automatically match claims in the brief directly to specific paragraph offsets in the source text, rendering side-by-side snippet previews when hovering over a claim.
2. **Automated "Counter-Claim" Pass:** An active verification agent that specifically prompts an LLM to search for contradictions, caveats, or dissenting opinions against the claims made in the source text.
3. **Author Voice Profiles:** Persistent local memory of author style decisions (e.g. "Author prefers 'subagent' without gloss; always keep sentences under 25 words").
4. **Rich Social Embeds:** Integrate official oEmbed APIs for X/Twitter and Substack URLs to handle social posts without brittle DOM scraping.

---

## 3. Editorial Judgment

### What Makes a Piece of Writing Clear and Useful?
- **Clarity** is achieved when a reader understands the core development, the stakes, and the trade-offs on the first pass without having to re-read sentences. It requires eliminating throat-clearing openings, removing pseudo-intellectual filler ("in today's rapidly evolving AI landscape"), and establishing clear agency (who built what).
- **Usefulness** requires preserving specific numbers, concrete constraints, pricing, and proper nouns. A summary that says "the new model is much cheaper and faster" is useless; a briefing that notes "it is priced at \$0.10 / \$0.50 per million tokens—around 75% cheaper than its predecessor—making high-volume extraction viable" is immediately actionable for an engineering budget.

### Evaluating Writing Assistant Quality
A writing assistant should be evaluated not by how many words it deletes, but by three qualitative criteria:
1. **Preservation of Authorial Intent:** Did the edit clarify the argument the author was making, or did it replace it with a generic restatement?
2. **Information Density:** Did numbers, technical constraints, and proper names survive intact?
3. **Voice Integrity:** Does the author still sound like an informed human subject-matter expert, rather than a boilerplate corporate communications department?

### Changes the Tool Should Never Make Automatically
1. **Never strip domain-defining technical terms:** If an article is explaining "cache read latency" or "speculative decoding", replacing those terms with "speed improvements" destroys the technical signal for engineering readers.
2. **Never flatten genuine uncertainty into certainty:** If a source states that Google "has not announced general availability reasons", the assistant must not rewrite this to "Google delayed release due to safety concerns."
3. **Never enforce a rigid sentence length ceiling:** Rhythmic prose requires variance. A 35-word sentence that balances two contrasting clauses can be compelling; reducing every sentence to 12 words creates staccato, monotonous copy.
4. **Never optimize readability formulas as a target:** Readability formulas (like Flesch-Kincaid) penalize multi-syllable domain terminology and syntactic nuance. Writing to maximize a readability score produces fifth-grade prose unsuitable for founders and technical leaders.
