import type { WritingMetrics } from "./types";

export function splitSentences(text: string) {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+(?=[A-Z0-9“"'(])/)
    .map((s) => s.trim())
    .filter((s) => s.split(/\s+/).length > 1);
}

export function splitParagraphs(text: string) {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function countSyllables(word: string) {
  const clean = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!clean) return 0;
  if (clean.length <= 3) return 1;
  const groups = clean.replace(/e$/, "").match(/[aeiouy]+/g);
  return Math.max(1, groups?.length || 1);
}

function fleschLabel(score: number) {
  if (score >= 70) return "Conversational";
  if (score >= 60) return "Plain";
  if (score >= 50) return "Fairly demanding";
  if (score >= 30) return "Dense";
  return "Very dense";
}

export function computeMetrics(text: string): WritingMetrics {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const sentences = splitSentences(text);
  const paragraphs = splitParagraphs(text);
  const wordCount = words.length;
  const sentenceCount = Math.max(sentences.length, wordCount ? 1 : 0);
  const syllables = words.reduce((sum, word) => sum + countSyllables(word), 0);
  const averageSentenceLength = sentenceCount ? wordCount / sentenceCount : 0;
  const fleschReadingEase = wordCount
    ? Math.round(
      (206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllables / wordCount)) *
      10,
    ) / 10
    : 0;

  return {
    wordCount,
    sentenceCount,
    paragraphCount: paragraphs.length,
    averageSentenceLength: Math.round(averageSentenceLength * 10) / 10,
    readingTimeMinutes: wordCount ? Math.max(1, Math.round(wordCount / 200) || 0) : 0,
    fleschReadingEase,
    fleschLabel: fleschLabel(fleschReadingEase),
    fleschNote:
      "This is a rough estimate of how quickly a general audience can parse the sentences. Newsletter writing can score lower when it keeps necessary technical terms. Do not chase the number.",
  };
}
