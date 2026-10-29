import { completeJson, LlmConfigError } from "@/lib/llm";
import { computeMetrics } from "@/lib/metrics";
import { writingSystemPrompt, writingUserPrompt } from "@/lib/prompts";
import type { AnalyzeResponse, WritingIssue } from "@/lib/types";
import { isAllowedIssueKind } from "@/lib/validateBrief";
import { runWritingChecks } from "@/lib/writingChecks";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { draft?: string };
    const draft = body.draft?.trim() || "";
    if (draft.split(/\s+/).length < 40) {
      return Response.json(
        { error: "Paste a draft of at least ~40 words so the checks have something to work on." },
        { status: 400 },
      );
    }

    const metrics = computeMetrics(draft);
    const ruleIssues = runWritingChecks(draft);
    let issues: WritingIssue[] = ruleIssues;
    let modelUsed = false;
    let warning: string | undefined;

    try {
      const llm = await completeJson<{ issues?: WritingIssue[] }>([
        { role: "system", content: writingSystemPrompt() },
        { role: "user", content: writingUserPrompt(draft, ruleIssues) },
      ]);
      modelUsed = true;

      const llmIssues: WritingIssue[] = (llm.issues || [])
        .filter((issue) => issue.original && draft.includes(issue.original.trim()))
        .filter((issue) => isAllowedIssueKind(issue.kind))
        .map((issue, index) => ({
          id: `model-${index}`,
          kind: issue.kind,
          source: "model",
          original: issue.original.trim(),
          suggestion: issue.suggestion?.trim() || null,
          explanation: issue.explanation,
          whyItMatters: issue.whyItMatters,
        }));

      const consumed = new Set<string>();
      const merged: WritingIssue[] = [];

      for (const rule of ruleIssues) {
        const match = llmIssues.find(
          (llmIssue) =>
            !consumed.has(llmIssue.id) &&
            (rule.original.includes(llmIssue.original) ||
              llmIssue.original.includes(rule.original)),
        );
        if (match) {
          consumed.add(match.id);
          merged.push({
            ...rule,
            suggestion: match.suggestion,
            explanation: match.explanation || rule.explanation,
            whyItMatters: match.whyItMatters || rule.whyItMatters,
          });
        } else {
          merged.push(rule);
        }
      }

      llmIssues
        .filter((issue) => !consumed.has(issue.id))
        .forEach((issue) => merged.push(issue));

      issues = merged.slice(0, 12);
    } catch (error) {
      warning =
        error instanceof LlmConfigError
          ? `${error.message} Rule-based checks still ran.`
          : `The model could not complete rewrite suggestions (${error instanceof Error ? error.message : "unknown error"}). Rule-based checks still ran.`;
    }

    const payload: AnalyzeResponse = { metrics, issues, modelUsed, warning };
    return Response.json(payload);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Analysis failed." },
      { status: 500 },
    );
  }
}
