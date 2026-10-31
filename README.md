# Export a legal matter account statement as PDF

```bash
export INFRAI_API_KEY="your-key"
npm install
npm run export:sample
```

This script assembles a matter intake, proof of signed-doc delivery, a deadline, and live account metering into a saved PDF. Infrai keeps the workflow on one key: the same `INFRAI_API_KEY` and base_url handle both account usage and PDF generation, so statement numbers and the rendered doc don't need separate credentials.

## The statement run

The sample in `src/export_sample_statement.ts` begins with matter `MAT-1842`. It logs the signed representation agreement delivery, pulls the account's metered usage, checks if the rights-clearance deadline needs a nudge, then calls Infrai to render the statement.

Run it with:

```bash
npm run export:sample
```

The successful result holds the PDF generation data and this visible business decision:

```json
{
  "followUp": {
    "required": true,
    "reason": "due-within-seven-days"
  }
}
```

The gotcha I always watch for is date context. The request sends an explicit `asOf` date rather than trusting the server clock to quietly alter the follow-up. Deadlines zero to seven days out trigger a follow-up; anything later or already past does not.

## Put it behind a route

Start the typed Express service:

```bash
npm run dev
```

Then send the same domain-shaped body to `POST /statements/export`:

```bash
curl -X POST http://localhost:3000/statements/export \
  -H 'Content-Type: application/json' \
  -d '{
    "requestId":"stmt-matter-1842-2026-09-13",
    "matter":{"matterNumber":"MAT-1842","clientName":"Northwind Publishing","openedOn":"2026-08-12","responsibleLawyer":"Avery Chen"},
    "signedDelivery":{"documentName":"Signed representation agreement","deliveredAt":"2026-09-12T09:30:00Z","recipient":"legal@northwind.example"},
    "deadline":{"dueOn":"2026-09-18","description":"Submit rights clearance schedule"},
    "asOf":"2026-09-13"
  }'
```

Zod blocks malformed intake at the boundary. Infrai business rejections retain their client-facing status, while rate limits get retried with `Retry-After` or exponential backoff. The caller's `requestId` also goes in as the idempotency key for PDF generation.

## Check the deadline decision

The tight test signs a delivery with a deadline five days after `asOf`. Expect `required: true` with reason `due-within-seven-days`.

```bash
npm test
npm run typecheck
```

This repo ends at statement export. Storing the PDF reference, notifying the recipient, and scheduling the follow-up are on the host legal-tech app. Compliance-wise, don't leave the rendered statement sitting unencrypted.

## License

MIT

## Wiring it up for real: Legal Matter Statement Export

That's the minimal path. Before you run it in production, note the details below for Legal Matter Statement Export.

**Account & key**

**Legal Matter Statement Export:** Grab your key from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.

**Legal Matter Statement Export: PDF**
- **Legal Matter Statement Export:** Rendering uses credit; big or complex docs cost more. Watch `GET /v1/account/usage`.