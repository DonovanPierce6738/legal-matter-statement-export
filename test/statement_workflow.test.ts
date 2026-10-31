import assert from "node:assert/strict";
import test from "node:test";
import { decideDeadlineFollowUp, statementRequestSchema } from "../src/statement_workflow.js";

test("flags a delivered matter statement when its deadline is five days away", () => {
  const intake = statementRequestSchema.parse({
    requestId: "stmt-test-1842",
    matter: {
      matterNumber: "MAT-1842",
      clientName: "Northwind Publishing",
      openedOn: "2026-08-12",
      responsibleLawyer: "Avery Chen",
    },
    signedDelivery: {
      documentName: "Signed representation agreement",
      deliveredAt: "2026-09-12T09:30:00Z",
      recipient: "legal@northwind.example",
    },
    deadline: { dueOn: "2026-09-18", description: "Submit rights clearance schedule" },
    asOf: "2026-09-13",
  });

  assert.deepEqual(decideDeadlineFollowUp(intake), {
    required: true,
    reason: "due-within-seven-days",
  });
});
