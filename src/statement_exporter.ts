import { InfraiClient } from "./infrai_client.js";
import {
  decideDeadlineFollowUp,
  renderStatementHtml,
  type StatementRequest,
} from "./statement_workflow.js";

export async function exportMatterStatement(client: InfraiClient, input: StatementRequest) {
  const meteredUsage = await client.usageTimeseries();
  const followUp = decideDeadlineFollowUp(input);
  const html = renderStatementHtml(input, meteredUsage, followUp);
  const pdf = await client.generatePdf(html, input.requestId);
  return { pdf, followUp };
}
