import type { ResearchBrief } from "./types";

/** Offline fallback so the writing workflow can be demoed if the API key is missing. */
export const SAMPLE_BRIEF: ResearchBrief = {
  whatHappened:
    "In the last three weeks of October 2026, OpenAI, Anthropic, and Google each shipped a model that changes the cost of running AI in production — but they are not shipping the same product. OpenAI cut the price of capable computer-use in half with GPT-6.1 Terra. Anthropic made small-model work cheap enough to run as a subagent by default with Claude Haiku 5.5. Google held Gemini 4 Carbon, a frontier cyber and long-horizon model, to a trusted-defender preview.",
  whyItMatters:
    "The story is not 'three labs released models.' It is that the bottleneck for most product teams is shifting from capability to unit economics and access. Tasks that were too expensive to run thousands of times a day now have a default cheap path, while the most powerful cyber-capable model is being gated on purpose.",
  whoShouldCare: [
    {
      audience: "Founders building agents",
      why: "Haiku 5.5 and Terra both argue for splitting work: a fast model for volume, a frontier model for judgment. That architecture just got cheaper.",
    },
    {
      audience: "Operators watching margins",
      why: "OpenAI published a 50% Terra price cut; Anthropic says Haiku 5.5 is ~75% cheaper to run than Haiku 4.5, and cut Sonnet 5.5 cache reads in half.",
    },
    {
      audience: "Security and platform teams",
      why: "Carbon leads public cyber benchmarks but is not generally available. Access policy is now part of the product decision, not a footnote.",
    },
  ],
  sources: [
    {
      sourceUrl: "https://openai.com/index/introducing-gpt-6-1-terra",
      sourceTitle: "Introducing GPT-6.1 Terra",
      whatHappened:
        "OpenAI launched GPT-6.1 Terra as a fast computer-use and visual-reasoning model, available in ChatGPT Work, Codex, and the API as gpt-6.1-terra.",
      whyItMatters:
        "Terra is positioned as the model you actually run all day: cheaper than Sol/Astra, faster on computer-use, and explicitly aimed at high-volume work like invoice entry.",
      facts: [
        {
          claim:
            "Standard API pricing is $1 / $5 per million input/output tokens, 50% lower than GPT-5.6 Terra and GPT-6.1 Sol.",
          evidence: "Pricing and availability section of the OpenAI announcement.",
          sourceUrl: "https://openai.com/index/introducing-gpt-6-1-terra",
          sourceTitle: "Introducing GPT-6.1 Terra",
        },
        {
          claim:
            "At max reasoning effort, Terra solves 50.3% of Terminal-Bench 4.0, more than double GPT-5.6 Terra’s 21.5%.",
          evidence: "Software engineering results in the same post.",
          sourceUrl: "https://openai.com/index/introducing-gpt-6-1-terra",
          sourceTitle: "Introducing GPT-6.1 Terra",
        },
      ],
      analysis: [
        {
          claim: "Terra is 'good enough' to replace frontier models for most computer-use work.",
          whyUnverified:
            "The comparisons are OpenAI’s own, including an internal hallucination benchmark. Independent evals are not in this source.",
          sourceUrl: "https://openai.com/index/introducing-gpt-6-1-terra",
        },
      ],
      speculation: [],
    },
    {
      sourceUrl: "https://www.anthropic.com/claude-haiku-5-5",
      sourceTitle: "Claude Haiku 5.5",
      whatHappened:
        "Anthropic released Claude Haiku 5.5 on October 7 as its cheapest and fastest small model, with a new effort control and a price cut on Sonnet 5.5 cache reads.",
      whyItMatters:
        "Customers (Asana, HubSpot, AlphaSense, Box, Cognition) describe Haiku as a subagent and high-volume workhorse, not a flagship replacement.",
      facts: [
        {
          claim:
            "Haiku 5.5 input/output is $0.10 / $0.50 per million tokens for prompts up to 100k, versus $1 / $5 for Haiku 4.5.",
          evidence: "Pricing table in the Haiku 5.5 announcement.",
          sourceUrl: "https://www.anthropic.com/claude-haiku-5-5",
          sourceTitle: "Claude Haiku 5.5",
        },
        {
          claim:
            "Anthropic is halving Sonnet 5.5 cache-read prices to $0.10 per million tokens, about 20% cheaper on most agentic work.",
          evidence: "Further updates section of the same post.",
          sourceUrl: "https://www.anthropic.com/claude-haiku-5-5",
          sourceTitle: "Claude Haiku 5.5",
        },
      ],
      analysis: [
        {
          claim: "Small models are now accurate enough to trust on extraction and CRM audit tasks.",
          whyUnverified:
            "Customer quotes are selected by Anthropic. HubSpot’s 92.8% is on HubSpot’s own suite, not a public benchmark.",
          sourceUrl: "https://www.anthropic.com/claude-haiku-5-5",
        },
      ],
      speculation: [],
    },
    {
      sourceUrl:
        "https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/",
      sourceTitle: "Gemini 4 Carbon",
      whatHappened:
        "Google DeepMind announced Gemini 4 Carbon on October 28 as its strongest model for cybersecurity and long-horizon tasks, with a staged rollout to cyber defenders.",
      whyItMatters:
        "Carbon is the counterpoint: capability is ahead of distribution. The interesting question is access, not the leaderboard.",
      facts: [
        {
          claim:
            "Carbon scores 88.2% on SEC-bench Pro, 54.8% on ExploitGym, and 71.0% on CWE-bench, evaluated without guardrails.",
          evidence: "Cybersecurity benchmark section of the Google blog post.",
          sourceUrl:
            "https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/",
          sourceTitle: "Gemini 4 Carbon",
        },
        {
          claim:
            "Introductory price matches Argon at $2 / $10 per million input/output tokens; after the intro period it becomes $4 / $20.",
          evidence: "Pricing notes in the announcement.",
          sourceUrl:
            "https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/",
          sourceTitle: "Gemini 4 Carbon",
        },
      ],
      analysis: [
        {
          claim: "Google is delaying general access because of cyber dual-use risk.",
          whyUnverified:
            "Google says it is in a U.S. pre-release testing process and gathering feedback on guardrails. Motive beyond that is inferred.",
          sourceUrl:
            "https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/",
        },
      ],
      speculation: [
        {
          claim: "Carbon will remain restricted long enough to change who can ship cyber-defense products on Gemini.",
          whyUnverified: "The post only says access will expand 'as soon as possible.'",
          sourceUrl:
            "https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/",
        },
      ],
    },
  ],
  tensions: [
    "OpenAI and Anthropic are competing on making capable models cheap and widely available. Google is competing on a gated cyber-frontier model.",
    "Vendor benchmarks are not comparable across posts (Agents’ Last Exam vs OSWorld vs SEC-bench). Treat cross-lab scoreboard claims as marketing unless the same eval is cited.",
  ],
  openQuestions: [
    "How much of Terra’s computer-use gain holds up outside OpenAI’s evals?",
    "Will Haiku 5.5 actually replace Sonnet for subagents in production, or only for extraction?",
    "When does Carbon leave the Fairwind preview, and under what use restrictions?",
  ],
  angles: [
    {
      headline: "The useful model got cheap. The dangerous one got gated.",
      pitch:
        "Tell the week as a split: volume work is now an architecture problem (Terra + Haiku), while the most capable cyber model is a policy problem (Carbon).",
      whyNow: "Three primary-source launches in three weeks, with hard prices and an explicit access delay.",
      evidenceUrls: [
        "https://openai.com/index/introducing-gpt-6-1-terra",
        "https://www.anthropic.com/claude-haiku-5-5",
        "https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/",
      ],
    },
    {
      headline: "Stop paying frontier prices for chores.",
      pitch:
        "A practical operator piece: what to route to Haiku/Terra, what still belongs on Sonnet/Sol/Astra, and how October’s price cuts change the spreadsheet.",
      whyNow: "Concrete list prices and customer quotes about subagents, CRM audits, and 8M weekly document queries.",
      evidenceUrls: [
        "https://openai.com/index/introducing-gpt-6-1-terra",
        "https://www.anthropic.com/claude-haiku-5-5",
      ],
    },
  ],
  editorNote:
    "Do not declare a winner. Do not mix lab benchmarks into one table. Every price and score in the brief comes from a vendor blog; say so. Carbon’s exploit numbers were reported 'without guardrails' — do not imply the shipped product exposes that capability to everyone.",
};
