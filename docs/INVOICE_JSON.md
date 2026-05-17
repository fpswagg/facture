## Invoice JSON format

facture exports and imports invoices as JSON files. Use this format to back up invoices, move them between devices, or generate them programmatically.

## File envelope

Every exported file uses this top-level structure:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `format` | string | yes | Must be `facture.invoice` |
| `version` | string | yes | Must be `1.0` |
| `exportedAt` | string | yes | ISO 8601 timestamp (UTC) when the file was created |
| `form` | object | yes | Invoice header and metadata |
| `lineItems` | array | yes | At least one line item (nested children allowed) |

## Example

```json
{
  "format": "facture.invoice",
  "version": "1.0",
  "exportedAt": "2026-05-17T12:00:00.000Z",
  "form": {
    "invoiceNumber": "FAC-2026-001",
    "issueDate": "2026-05-17",
    "showDueDate": true,
    "dueDate": "2026-05-24",
    "currency": "EUR",
    "projectRef": "Site vitrine — phase 1",
    "fromName": "fpswagg",
    "fromEmail": "billing@fpswagg.com",
    "fromAddress": "Rue, ville, code postal, pays",
    "showClient": true,
    "clientName": "Acme Corp",
    "clientEmail": "client@acme.com",
    "clientAddress": "1 rue Example, 75000 Paris",
    "notes": "Merci pour votre confiance.",
    "terms": "Paiement sous 7 jours.",
    "paymentDetails": "Virement — IBAN FR76 XXXX"
  },
  "lineItems": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "service": "Développement frontend",
      "description": "Intégration UI facture",
      "amount": 1200,
      "children": []
    },
    {
      "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "service": "Mission complète",
      "description": "Regroupe plusieurs prestations",
      "amount": 0,
      "children": [
        {
          "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
          "service": "API",
          "description": "Endpoints REST",
          "amount": 800,
          "children": []
        }
      ]
    }
  ]
}
```

## `form` object

| Field | Type | Description |
|-------|------|-------------|
| `invoiceNumber` | string | Displayed on the invoice (e.g. `FAC-2026-001`) |
| `issueDate` | string | `YYYY-MM-DD` |
| `showDueDate` | boolean | If `false`, due date is hidden on the invoice |
| `dueDate` | string | `YYYY-MM-DD`; required in the app when `showDueDate` is `true` |
| `currency` | string | ISO 4217 code, 3 letters (e.g. `EUR`, `USD`) |
| `projectRef` | string | Optional reference or project name |
| `fromName` | string | Issuer name |
| `fromEmail` | string | Issuer email |
| `fromAddress` | string | Issuer address (multiline text allowed) |
| `showClient` | boolean | If `false`, client block is omitted from preview/PDF |
| `clientName` | string | Client name (can be empty) |
| `clientEmail` | string | Client email (can be empty) |
| `clientAddress` | string | Client address (can be empty) |
| `notes` | string | Notes block on invoice |
| `terms` | string | Terms block on invoice |
| `paymentDetails` | string | IBAN, Wise, PayPal, or other payment instructions |

## `lineItems` array

Each element:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique id (UUID recommended). Regenerated on import if missing |
| `service` | string | Service / prestation name |
| `description` | string | Optional detail |
| `amount` | number | Line total in invoice currency (2 decimal places recommended) |
| `children` | array | Nested lines; parent `amount` is ignored in the app and computed as the sum of children |

### Parent rows

- A row with non-empty `children` is a **group** row.
- The parent’s `amount` in the file may be `0` or any value; the app recalculates the parent total from children.
- Nesting can be arbitrarily deep.

## Import compatibility

The importer also accepts legacy shapes:

1. **Local draft** (browser storage): `{ "formValues": { ... }, "lineItems": [ ... ] }`
2. **Older line items** with `quantity` and `unitPrice` instead of `amount`: amount is computed as `quantity * unitPrice` when `amount` is omitted.

Files must be valid JSON. Unknown `format` values are rejected.

## Validation rules (app)

On import, the app checks:

- Valid JSON syntax
- `format` is `facture.invoice` and `version` is `1.0` for canonical files
- At least one line item
- Required `form` fields present (see app validation for sender name, email, address, and optional due date)

After import, the invoice is loaded into the editor and saved to local draft storage.

## Versioning

| Version | Notes |
|---------|--------|
| `1.0` | Initial format: `form` + nested `lineItems` with `amount` only |

Future versions may add fields while keeping `1.0` import support.
