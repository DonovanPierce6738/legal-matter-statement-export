import { infraiFromEnvironment } from "./infrai_client.js";
import { exportMatterStatement } from "./statement_exporter.js";

const result = await exportMatterStatement(infraiFromEnvironment(), {
  requestId: "stmt-matter-1842-2026-09-13",
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
  deadline: {
    dueOn: "2026-09-18",
    description: "Submit rights clearance schedule",
  },
  asOf: "2026-09-13",
});

console.log(JSON.stringify(result, null, 2));
