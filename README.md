## facture

Invoice generator for fpswagg. Build nested service lines, preview live, export as PDF (print) or JSON, and import JSON backups.

## Setup

1. Copy environment file:

```bash
cp .env.example .env
```

2. Set your portfolio URL in `.env`:

```bash
VITE_PORTFOLIO_URL=https://your-site.com
```

3. Install dependencies and run:

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run preview` — preview production build
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript check

## Languages

- Default: **French** (`fr`) — app name **facture**
- English (`en`) — app name **invoice**
- Switch language in the header; preference is saved in `localStorage`

## Features

- Nested line items (parent totals roll up from children)
- Line columns: service, description, amount (no tax, shipping, discounts, or hours)
- Optional client block (show/hide; empty values allowed)
- Optional due date (toggle on/off)
- Project reference and payment details fields
- Live preview with portfolio link + QR code
- Local draft auto-save (v2, migrates v1 drafts)
- Print / PDF export (browser print dialog)
- JSON export and import (`facture.invoice` v1.0)

## JSON import / export

Use **Export as JSON** and **Import from JSON** in the Actions panel.

- Canonical format: `format: "facture.invoice"`, `version: "1.0"`, with `form` and `lineItems`
- Also accepts legacy local-draft shape (`formValues` + `lineItems`) and older lines with `quantity` × `unitPrice`

Full specification: [docs/INVOICE_JSON.md](docs/INVOICE_JSON.md)
