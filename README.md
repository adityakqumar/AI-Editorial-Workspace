# Copydesk — AI Editorial Workspace

> A focused editorial workspace for newsletter editors at [This Week in AI](https://thisweekin.ai). Built to help an editor go from raw industry noise to an evidence-grounded research brief, and from a rough draft to a sharp, publishable piece — without pretending readability formulas substitute for editorial judgment.

Designed for the Forward Deployed Engineer take-home challenge (6–8 hour scope).

---

## Deliverables Index

| Deliverable | Description | Link |
| :--- | :--- | :--- |
| **Working Application** | Next.js 16 App Router application with Research & Writing desks | [Local setup instructions below](#quickstart) |
| **Product & Engineering Note** | Product thinking, engineering architecture, and editorial evaluation | [`PRODUCT.md`](./PRODUCT.md) |
| **Sample Editorial Output** | Final ~430-word newsletter piece on model economics and access | [`SAMPLE_EDITORIAL.md`](./SAMPLE_EDITORIAL.md) |
| **Before / After Analysis** | Original bloated draft, assistant suggestions flagged, and final piece | [`BEFORE_AFTER.md`](./BEFORE_AFTER.md) |

---

## Core Capabilities

### 1. Research Assistant (Part A)
- **Multi-source ingestion**: Accepts at least 3 URLs, tweets, or raw pasted excerpts.
- **Resilient fetching**: 12-second timeout, `cheerio` HTML body extraction, and automatic fallback to pasted notes on scraping blocks or thin payloads.
- **Fact vs. Analysis vs. Speculation**: Color-coded badges and strict separation so editors never confuse vendor claims or commentary with verified reality.
- **Citation grounding**: Server-side allowlist (`sanitizeBrief`) strips any citation claiming a URL not provided in the source set.
- **Story angles & handoff**: Surfaces 2–3 differentiated newsletter angles (tailored to founders, operators, or security leaders) with a single-click handoff into the Writing Desk.
- **Export**: One-click "Copy brief as Markdown" for team sharing or Notion/Slack handoff.

### 2. Writing Assistant (Part B)
- **Hemingway-inspired visual highlights**:
  - 🟡 **Yellow**: Long sentences (splits compound clauses, em-dashes, or semicolons)
  - 🟣 **Purple**: Passive voice (prompts naming the company, person, or model that acted)
  - 🔵 **Blue**: Filler & hedging phrases ("due to the fact that", "it is important to note that")
  - 🔴 **Coral**: Unexplained technical jargon needing a gloss ("agentic", "flywheel", "robust")
  - 🟢 **Sage**: Dense paragraphs (>90 words across <=2 sentences)
- **Interactive draft preview**: Clicking any highlighted passage jumps to and selects its actionable suggestion card.
- **Writer in control**:
  - Suggestions are never auto-applied.
  - One-click **Accept rewrite** applies the change cleanly to the working copy.
  - Dedicated **Undo** button on accepted cards lets writers roll back changes at any time.
  - Reconsider option for rejected ideas.
- **Compare Original & Revised**: Side-by-side view with frozen baseline and **Editorial Comparison Delta**:
  - Word count change ($308 \to 285$ words)
  - Average sentence length reduction
  - Readability score change ($46.3 \to 58.2$)
  - Accepted vs. rejected edit tallies
- **Metrics with editorial caveats**: Displays Word Count, Sentence Length, Readability (Flesch), and Reading Time with explicit warnings that newsletter writing should never blindly chase readability formulas at the cost of technical precision.

---

## Quickstart

### Prerequisites
- Node.js 18+ (tested on Node.js 20 & 22)
- npm or yarn

### 1. Clone & Install
```bash
git clone <repo-url>
cd oct29
npm install
```

### 2. Configure Environment (Optional)
Copydesk includes an **Offline Mode** that works out of the box without any API keys (using a curated October 2026 brief and deterministic writing checks).

To enable live web scraping, real-time brief generation, and LLM rewrite suggestions:
```bash
cp .env.example .env.local
```

You can configure either **OpenAI** or **Google Gemini**:

**Option A: OpenAI**
```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini           # Optional, defaults to gpt-4o-mini
OPENAI_BASE_URL=https://api.openai.com/v1 # Optional
```

**Option B: Google Gemini**
```env
GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-1.5-flash     # Optional, defaults to gemini-1.5-flash
# Uses Gemini's OpenAI-compatible endpoint: https://generativelanguage.googleapis.com/v1beta/openai
```

### 3. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production Build & Verification
```bash
npm run build
npm start
```
Linting check:
```bash
npm run lint
```

---

## Offline Walkthrough (No API Key Required)

1. Open [http://localhost:3000](http://localhost:3000).
2. On the **Research** tab, click **Use offline brief** to inspect a curated brief synthesized from October 2026 releases (OpenAI GPT-6.1 Terra, Claude Haiku 5.5, Gemini 4 Carbon).
3. Review the **Facts vs. Analysis vs. Speculation** breakdown and click **Draft from this angle** under "The useful model got cheap. The dangerous one got gated."
4. Switch to the **Write** tab, or click **Load sample draft** to load an intentionally bloated draft.
5. Click **Analyze draft** to run the deterministic writing engine.
6. Inspect the Hemingway color-coded highlights and test accepting suggestions, undoing edits, and toggling **Compare original & revised** to see the editorial metrics delta.

---

## Architecture & Code Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── research/route.ts   # Ingestion, fetch orchestration, LLM prompt & citation sanitizer
│   │   │   └── analyze/route.ts    # Deterministic checks + LLM rewrite suggestion merger
│   │   ├── layout.tsx              # Clean typography and root styling
│   │   ├── page.tsx                # Workspace root entrypoint
│   │   └── globals.css             # Editorial palette and Hemingway color tokens
│   ├── components/
│   │   ├── Workspace.tsx           # State coordination between Research & Writing desks
│   │   ├── ResearchView.tsx        # Multi-source inputs, fetch status, and structured brief display
│   │   └── WritingView.tsx         # Interactive editor, Hemingway highlights, metrics & compare diff
│   └── lib/
│       ├── types.ts                # TypeScript domain models (ResearchBrief, WritingIssue, Metrics)
│       ├── llm.ts                  # Multi-provider client (OpenAI & Gemini OpenAI-compatible)
│       ├── prompts.ts              # System and user prompts for brief synthesis & rewrite review
│       ├── fetchSource.ts          # Cheerio body extractor with timeout & fallback handling
│       ├── writingChecks.ts        # Deterministic rules (long sentence, passive, filler, jargon, dense)
│       ├── metrics.ts              # Word count, sentence stats, and Flesch reading ease calculator
│       ├── validateBrief.ts        # Anti-hallucination URL allowlist filter
│       ├── sample.ts               # Sample October source URLs and bloated test draft
│       └── sampleBrief.ts          # Curated offline brief for keyless evaluation
├── PRODUCT.md                      # Product thinking, architecture decisions & editorial judgment
├── SAMPLE_EDITORIAL.md             # Polished 430-word newsletter piece with citations
├── BEFORE_AFTER.md                 # Original draft, assistant notes, and final piece comparison
└── package.json
```

---

## Disclosure of Tools & Implementation

- **Next.js 16 (App Router) & React 19**: Modern UI and API routes.
- **Tailwind CSS 4**: Minimalist editorial typography and color palettes.
- **Cheerio**: Robust server-side HTML text parsing with fallback to pasted text.
- **OpenAI & Google Gemini APIs**: Chat Completions with strict JSON outputs for narrative synthesis and nuanced rewrites.
- **Personally implemented and verified**: All domain logic, heuristic writing checks, metrics engine, anti-hallucination URL grounding, accept/reject/undo state management, comparison delta calculation, test fixtures, and editorial evaluation notes.
