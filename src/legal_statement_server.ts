import express from "express";
import { ZodError } from "zod";
import { InfraiError, infraiFromEnvironment } from "./infrai_client.js";
import { exportMatterStatement } from "./statement_exporter.js";
import { statementRequestSchema } from "./statement_workflow.js";

const app = express();
app.use(express.json({ limit: "256kb" }));

app.post("/statements/export", async (request, response) => {
  try {
    const input = statementRequestSchema.parse(request.body);
    const result = await exportMatterStatement(infraiFromEnvironment(), input);
    response.status(201).json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      response.status(400).json({ error: "invalid_statement_request", issues: error.issues });
      return;
    }
    if (error instanceof InfraiError) {
      const status = error.status >= 400 && error.status < 500 ? error.status : 502;
      response.status(status).json({ error: error.code, details: error.details });
      return;
    }
    response.status(502).json({ error: "statement_export_failed" });
  }
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => console.log(`Legal statement service listening on http://localhost:${port}`));
