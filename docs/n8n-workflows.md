# n8n (automation) integration guide

PRITIVO exposes **one signed inbound webhook** that any automation tool (n8n, Zapier, Make, or your own
service) can call. It is disabled until `N8N_WEBHOOK_SECRET` is set.

## Endpoint

```
POST https://your-domain/api/webhooks/n8n/{workflow}
Content-Type: application/json
x-pritivo-signature: sha256=<HMAC-SHA256 of the RAW body using N8N_WEBHOOK_SECRET>
x-pritivo-event-id: <unique id for idempotency>   (optional, sent inside the body as "eventId")
```

Body:

```json
{ "type": "enquiry-created", "eventId": "evt-8f21c", "reference": "PVH-ENQ-4F9K2P", "payload": {} }
```

Allowed `type` values: `enquiry-created`, `quotation-generated`, `booking-updated`, `payment-updated`,
`supplier-updated`, `reminder-sent`, `feedback-requested`, `assistant-handoff`.

Behaviour (all verified in code, `src/app/api/webhooks/n8n/[workflow]/route.ts`):
- **No secret configured → 503** (webhooks are closed by default, never open).
- **Missing/malformed/invalid signature → 401** and an audit entry (`webhook.signature_rejected`).
- Signature is compared with `timingSafeEqual` over the raw body; replay protection uses `eventId` (duplicates are
  acknowledged but ignored, logged as `webhook.duplicate_ignored`).
- Rate limited to 60 requests/minute per IP.
- Events are **recorded, not applied**. Booking, payment and supplier status changes must still be made by staff in
  `/admin`, so automation can never silently confirm a booking or mark a payment as received.

### n8n HMAC node configuration
1. **Webhook / HTTP Request** node → method POST, URL as above.
2. Before sending, add a **Code** node that computes the signature:
   ```js
   const crypto = require('crypto');
   const secret = $env.N8N_WEBHOOK_SECRET;
   const body = JSON.stringify($json.body);
   return [{ json: { body, signature: 'sha256=' + crypto.createHmac('sha256', secret).update(body).digest('hex') } }];
   ```
3. Set headers `Content-Type: application/json`, `x-pritivo-signature: {{ $json.signature }}`.

## Suggested workflows

| ID | Workflow | Trigger | PRITIVO side |
| --- | --- | --- | --- |
| WF-01 | Customer enquiry management | New row in `enquiries` (DB trigger or poll) | Notify staff on WhatsApp/email; SLA timer |
| WF-02 | AI travel assistant handoff | `assistant-handoff` event | Route complex questions to a human queue |
| WF-03 | CRM enrichment | New `customers` row | Add follow-up task, tag preferences |
| WF-04 | Supplier management | `supplier-updated` | Remind staff to re-verify unverified partners |
| WF-05 | Automatic quotation drafting | `enquiry-created` | Pre-fill a draft quote for staff review (never auto-send prices) |
| WF-06 | Booking & payment tracking | `payment-updated`, `booking-updated` | Reconcile gateway records with `hotel_bookings` |
| WF-07 | WhatsApp & email notifications | Any status change | Send guest updates via the official WhatsApp Business Platform / email provider |
| WF-08 | Travel reminders & feedback | Scheduled (T-7 / T+2 days) | Send reminders and post-trip feedback requests |

Guardrails for every workflow: never write a `confirmed` status without supplier confirmation and recorded payment,
never invent prices, and keep credentials in n8n's own credential store (not in workflow JSON).

## Outbound notifications from PRITIVO
- **Email**: Resend via `RESEND_API_KEY` + `BOOKING_EMAIL_FROM` (`src/lib/email.ts`). Booking confirmations and admin
  enquiry notifications use it; without keys the message is logged server-side instead.
- **WhatsApp**: currently click-to-chat links (`wa.me/917892337596`) and `mailto:` links — no API key required.
  Official WhatsApp Business Platform (Meta Cloud API) automation requires business verification, an approved message
  template and a paid conversation tier; that is a future integration, not something this repo can enable by itself.
