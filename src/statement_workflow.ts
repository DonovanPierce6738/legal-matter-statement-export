import { z } from "zod";

export const statementRequestSchema = z.object({
  requestId: z.string().min(8),
  matter: z.object({
    matterNumber: z.string().min(1),
    clientName: z.string().min(1),
    openedOn: z.string().date(),
    responsibleLawyer: z.string().min(1),
  }),
  signedDelivery: z.object({
    documentName: z.string().min(1),
    deliveredAt: z.string().datetime(),
    recipient: z.string().email(),
  }),
  deadline: z.object({
    dueOn: z.string().date(),
    description: z.string().min(1),
  }),
  asOf: z.string().date(),
});

export type StatementRequest = z.infer<typeof statementRequestSchema>;

export type FollowUpDecision = {
  required: boolean;
  reason: "due-within-seven-days" | "no-immediate-follow-up";
};

export function decideDeadlineFollowUp(input: StatementRequest): FollowUpDecision {
  const day = 86_400_000;
  const daysRemaining = Math.ceil(
    (Date.parse(`${input.deadline.dueOn}T00:00:00Z`) - Date.parse(`${input.asOf}T00:00:00Z`)) / day,
  );
  const required = daysRemaining >= 0 && daysRemaining <= 7;
  return {
    required,
    reason: required ? "due-within-seven-days" : "no-immediate-follow-up",
  };
}

export function renderStatementHtml(
  input: StatementRequest,
  meteredUsage: unknown,
  followUp: FollowUpDecision,
): string {
  const usage = escapeHtml(JSON.stringify(meteredUsage, null, 2));
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Account statement</title>
<style>body{font-family:Arial,sans-serif;color:#20242a;margin:48px}h1{font-size:26px}dt{font-weight:bold;margin-top:12px}pre{background:#f3f4f6;padding:16px;white-space:pre-wrap}.status{border-left:4px solid #2d6a4f;padding-left:12px}</style></head>
<body><h1>Legal matter account statement</h1>
<dl><dt>Matter</dt><dd>${escapeHtml(input.matter.matterNumber)} · ${escapeHtml(input.matter.clientName)}</dd>
<dt>Opened</dt><dd>${input.matter.openedOn}</dd><dt>Responsible lawyer</dt><dd>${escapeHtml(input.matter.responsibleLawyer)}</dd></dl>
<h2>Signed document delivery</h2><p>${escapeHtml(input.signedDelivery.documentName)} was delivered to ${escapeHtml(input.signedDelivery.recipient)} on ${escapeHtml(input.signedDelivery.deliveredAt)}.</p>
<h2>Metered account usage</h2><pre>${usage}</pre>
<h2>Deadline follow-up</h2><p class="status">${escapeHtml(input.deadline.description)} is due ${input.deadline.dueOn}. Decision: ${followUp.reason}.</p>
</body></html>`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;",
  })[character] ?? character);
}
