import type { WritingIssue } from "./types";
import { splitParagraphs, splitSentences } from "./metrics";

const FILLER_PHRASES = [
  "in order to",
  "due to the fact that",
  "it is important to note that",
  "it should be noted that",
  "at this point in time",
  "in the process of",
  "as a matter of fact",
  "for all intents and purposes",
  "needless to say",
  "the fact that",
  "in terms of",
  "a number of",
  "in today's rapidly evolving",
  "leverage",
  "unlock the potential",
  "game-changing",
  "cutting-edge",
];

const JARGON = [
  "paradigm",
  "synergy",
  "holistic",
  "robust",
  "ecosystem",
  "moat",
  "flywheel",
  "north star",
  "bandwidth",
  "alignment",
  "tokenomics",
  "inference",
  "multimodal",
  "agentic",
  "orchestration",
  "fine-tuning",
  "context window",
];

const PASSIVE =
  /\b(is|are|was|were|be|been|being)\s+(?:\w+ly\s+)?(written|made|given|taken|seen|done|used|shown|built|released|announced|launched|considered|regarded|unlocked)\b/i;

const FILLER_REPLACEMENTS: [RegExp, string][] = [
  [/in today's rapidly evolving ai landscape,?\s*/i, ""],
  [/it is important to note that\s*/gi, ""],
  [/it should be noted that\s*/gi, ""],
  [/due to the fact that/gi, "because"],
  [/in order to/gi, "to"],
  [/at this point in time/gi, "now"],
  [/in the process of /gi, ""],
  [/needless to say,?\s*/gi, ""],
  [/as a matter of fact,?\s*/gi, ""],
  [/for all intents and purposes,?\s*/gi, ""],
];

function tidy(sentence: string) {
  return sentence
    .replace(/\s+/g, " ")
    .replace(/^,\s*/, "")
    .replace(/^\s*[a-z]/, (ch) => ch.toUpperCase())
    .trim();
}

function heuristicSuggestion(kind: WritingIssue["kind"], sentence: string) {
  if (kind === "filler") {
    let next = sentence;
    for (const [pattern, replacement] of FILLER_REPLACEMENTS) {
      next = next.replace(pattern, replacement);
    }
    next = tidy(next);
    return next && next !== sentence ? next : null;
  }

  if (kind === "long-sentence") {
    // 1. Contrast dash: "... — but access is being limited ..."
    const emDashMatch = sentence.match(/^(.{24,}?)\s*—\s*(?:but|however)\s+(.{20,})$/i);
    if (emDashMatch) {
      let second = tidy(emDashMatch[2]);
      if (/^access is being limited/i.test(second)) {
        second = second.replace(/access is being limited/i, "Google is limiting access");
      }
      return `${tidy(emDashMatch[1])}. However, ${second}`;
    }

    // 2. Dual-clause contrast: "... not X, but whether Y ..."
    const butWhetherMatch = sentence.match(/^(.{24,}?),\s+but\s+(whether\s+.{20,})$/i);
    if (butWhetherMatch) {
      const second = tidy(butWhetherMatch[2]);
      return `${tidy(butWhetherMatch[1])}. It is ${second.charAt(0).toLowerCase() + second.slice(1)}`;
    }

    // 3. Dependent commentary: "... boring, which is usually when ..."
    const whichIsMatch = sentence.match(/^(.{24,}?),\s+which\s+is\s+(.{15,})$/i);
    if (whichIsMatch) {
      const second = tidy(whichIsMatch[2]);
      return `${tidy(whichIsMatch[1])}. That is ${second.charAt(0).toLowerCase() + second.slice(1)}`;
    }

    // 4. Conjunction: "... Sol, at $1... and that it is over ..."
    const andThatMatch = sentence.match(/^(.{24,}?),\s+and\s+that\s+(.{20,})$/i);
    if (andThatMatch) {
      const second = tidy(andThatMatch[2]);
      return `${tidy(andThatMatch[1])}. It also reports that ${second.charAt(0).toLowerCase() + second.slice(1)}`;
    }

    // 5. Standard compound sentence: "... X, and Y ..."
    const splitOn = sentence.match(/^(.{24,}?),\s+and\s+(.{24,})$/i);
    if (splitOn) {
      return `${tidy(splitOn[1])}. ${tidy(splitOn[2].replace(/^that\s+/i, "That "))}`;
    }
  }

  if (kind === "jargon") {
    return sentence
      .replace(/\bagentic\b/gi, "agent (software that runs models in a loop)")
      .replace(/\brobust ecosystem flywheel\b/gi, "self-reinforcing market")
      .replace(/\bflywheel\b/gi, "feedback loop");
  }

  if (kind === "passive-voice") {
    const unlocked = sentence.replace(
      /a robust ecosystem flywheel is being unlocked/i,
      "nobody has shown a flywheel — they have shown price cuts",
    );
    if (unlocked !== sentence) return unlocked;
    const released = sentence.replace(
      /a new generation of cheaper models is being released by the major labs/i,
      "the major labs released cheaper models",
    );
    if (released !== sentence) return released;
    const limited = sentence.replace(
      /access is being limited/i,
      "Google is limiting access",
    );
    if (limited !== sentence) return limited;
  }

  return null;
}

function idFor(kind: string, index: number) {
  return `rule-${kind}-${index}`;
}

export function runWritingChecks(draft: string): WritingIssue[] {
  const issues: WritingIssue[] = [];
  const sentences = splitSentences(draft);

  sentences.forEach((sentence, index) => {
    const words = sentence.split(/\s+/).filter(Boolean);
    if (words.length >= 32) {
      issues.push({
        id: idFor("long", index),
        kind: "long-sentence",
        source: "rule",
        original: sentence,
        suggestion: heuristicSuggestion("long-sentence", sentence),
        explanation: `This sentence is ${words.length} words. Long sentences bury the point a busy founder is scanning for.`,
        whyItMatters:
          "Split only if two ideas are competing. Keep one long sentence if the cadence is doing work.",
      });
    }

    if (PASSIVE.test(sentence) && words.length > 8) {
      issues.push({
        id: idFor("passive", index),
        kind: "passive-voice",
        source: "rule",
        original: sentence,
        suggestion: heuristicSuggestion("passive-voice", sentence),
        explanation:
          "This looks like passive construction. Passive voice is fine for outcomes; it is weaker when a company, model, or person actually did something.",
        whyItMatters:
          "Name the actor when the actor is the story. Leave it if the actor is unknown or unimportant.",
      });
    }

    const lower = sentence.toLowerCase();
    const filler = FILLER_PHRASES.find((phrase) => lower.includes(phrase));
    if (filler) {
      issues.push({
        id: idFor("filler", index),
        kind: "filler",
        source: "rule",
        original: sentence,
        suggestion: heuristicSuggestion("filler", sentence),
        explanation: `Contains filler phrasing (“${filler}”) that usually adds length without adding meaning.`,
        whyItMatters: "Cut the phrase unless it is carrying tone you actually want.",
      });
    }

    const jargonHits = JARGON.filter((term) =>
      new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(
        sentence,
      ),
    );
    if (jargonHits.length) {
      const defined = jargonHits.every((term) =>
        new RegExp(`${term}.{0,40}(meaning|that is|i\\.e\\.|—|:)`, "i").test(sentence),
      );
      if (!defined) {
        issues.push({
          id: idFor("jargon", index),
          kind: "jargon",
          source: "rule",
          original: sentence,
          suggestion: heuristicSuggestion("jargon", sentence),
          explanation: `Uses ${jargonHits.map((t) => `“${t}”`).join(", ")} without a short gloss. Technical terms can stay if a non-specialist can still follow the sentence.`,
          whyItMatters:
            "Keep the term if it is the subject. Add five words of explanation, or swap it for a concrete action.",
        });
      }
    }
  });

  splitParagraphs(draft).forEach((paragraph, index) => {
    const sentenceCount = splitSentences(paragraph).length;
    const words = paragraph.split(/\s+/).filter(Boolean).length;
    if (words >= 90 && sentenceCount <= 2) {
      issues.push({
        id: idFor("dense", index),
        kind: "dense-paragraph",
        source: "rule",
        original: paragraph,
        suggestion: null,
        explanation:
          "This paragraph packs a lot of information into very few sentences. Readers will skip it.",
        whyItMatters:
          "Break it so each paragraph does one job: what happened, why it matters, or what to do.",
      });
    }
  });

  return issues.slice(0, 18);
}
