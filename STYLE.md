## Identity

**facture** is fpswagg’s invoicing surface: ledger-clear, print-ready, and slightly arcade-sharp at the edges — not corporate beige, not SaaS gradient sludge. Dark forest green anchors trust; teal marks interactive “you” moments; parchment warmth keeps long tables from feeling clinical. Voice is the same deadpan nerd as the rest of fpswagg: precise amounts, terse labels, no marketing fluff on system copy. Pixel display type and hard frames signal brand; **tabular numbers and aligned columns** signal that money is serious.

---

## Color system

### Core palette

- **Pine 900** `#0F3D2E` — primary dark green (brand-defining)
- **Pine 700** `#14532D` — primary hover/active; dark-mode primary surfaces
- **Pine 500** `#1B7A47` — mid-green; positive balances; paid states
- **Teal 500** `#14B8A6` — personality accent; links; focus rings
- **Teal 300** `#5EEAD4` — soft teal; hover highlights; points emphasis
- **Amber 500** `#F59E0B` — warm accent; discounts; pending payment
- **Magenta 500** `#EC4899` — alert; overdue; void — use sparingly
- **Indigo 700** `#3730A3` — secondary cool accent; notes / internal flags — sparingly

### Neutrals

- **Ink 950** `#0A0E0C` — dark-mode background base
- **Ink 800** `#1F2421` — dark-mode surface / panels
- **Ink 600** `#3A413D` — dark-mode border / divider; table rules
- **Mist 400** `#9CA3AF` — muted body text; secondary line labels
- **Bone 50** `#FAF7F0` — light-mode background; **print paper default**
- **Bone 100** `#F2EDE0` — light-mode surface; zebra stripe alternate
- **Ink 100** `#D1D5DB` — light-mode border / divider

### Mode roles

**Dark mode** (app chrome, editor, lists)

- Background: Ink 950
- Surface: Ink 800
- Primary (buttons, key actions): Pine 700
- Primary text: Bone 50
- Accent: Teal 500

**Light mode** (default for invoice preview and PDF)

- Background: Bone 50
- Surface: Bone 100
- Primary: Pine 900
- Primary text: Ink 950
- Accent: Teal 500

### Semantic tokens

- **success**: Pine 500 — paid, reconciled
- **info**: Teal 500 — sent, viewed
- **warning**: Amber 500 — partial payment, due soon
- **danger**: Magenta 500 (badges); `#DC2626` for long danger body text if Magenta fails contrast
- **muted**: Mist 400 — draft metadata, footnotes

### Invoice status mapping

Always pair color with a text label (and optional icon shape). Never rely on color alone.

| Status | Color | Notes |
|--------|-------|--------|
| `draft` | Mist 400 outline | Not issued |
| `issued` | Teal 500 | Sent to client |
| `viewed` | Teal 300 | Optional tracking |
| `partial` | Amber 500 | Part of total received |
| `paid` | Pine 500 | Balance zero |
| `overdue` | Magenta 500 | Past due date |
| `void` | Ink 600 + strikethrough on number | Cancelled |
| `refunded` | Indigo 700 outline | Money returned |

### Paste-ready CSS variables (example)

```css
:root[data-theme="dark"] {
  --bg: #0a0e0c;
  --surface: #1f2421;
  --border: #3a413d;
  --text: #faf7f0;
  --muted: #9ca3af;
  --primary: #14532d;
  --accent: #14b8a6;
  --table-stripe: #1a211e;
  --amount-positive: #1b7a47;
  --amount-negative: #ec4899;
}

:root[data-theme="light"] {
  --bg: #faf7f0;
  --surface: #f2ede0;
  --border: #d1d5db;
  --text: #0a0e0c;
  --muted: #9ca3af;
  --primary: #0f3d2e;
  --accent: #14b8a6;
  --table-stripe: #f2ede0;
  --amount-positive: #14532d;
  --amount-negative: #dc2626;
}
```

### Contrast (WCAG AA)

- Body: Bone 50 on Ink 950 (dark) or Ink 950 on Bone 50 (light).
- Small teal on dark: prefer Teal 300 or bump weight/size.
- Amount columns: meet 4.5:1 against row background; validate with a contrast checker before ship.

---

## Typography

### Font roles

- **Display / wordmark** — Press Start 2P, 400 — `facture` logo, app title, single hero line only
- **Headings** — Space Grotesk, 600 / 700 — invoice title, section headers (`Bill to`, `Line items`)
- **Body** — Inter, 400 / 500 — addresses, notes, terms
- **Monospace** — JetBrains Mono, 400 / 500 — invoice numbers, SKUs, tax IDs, payment refs
- **Figures** — JetBrains Mono with `font-variant-numeric: tabular-nums` — **all money columns, qty, rates, points**

Google Fonts load example:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=JetBrains+Mono:wght@400;500&family=Press+Start+2P&family=Space+Grotesk:wght@600;700&display=swap" rel="stylesheet">
```

### Rules

- No Press Start 2P for line items, totals, or legal text.
- Invoice number and fpswagg issuer block: mono for IDs, Inter for names.
- Table headers: Space Grotesk 600, uppercase, `letter-spacing: 0.06em`.
- Right-align all numeric columns; left-align description; center qty only if column is narrow.

---

## Logo and wordmark

- **Wordmark**: `facture` in Press Start 2P, lowercase. Final **`e`** replaced with Teal 500 pixel block (receipt tear / stamp).
- **Lockup**: `facture` + subdued `for fpswagg` in Space Grotesk 500, Mist 400 — only in app chrome, not on client-facing PDF header unless brand policy requires it.
- **Icon**: 5×5 grid monogram `f` in Pine 700, one Teal 500 pixel.
- **Dark variant**: Pine 700 letters, Teal accent, Ink 950 ground.
- **Light variant**: Pine 900 letters, Teal accent, Bone 50 ground.
- Clear space: cap height of `a` on all sides. Scale proportionally only.

---

## Invoice layout (document model)

### Regions (top to bottom)

1. **Header** — wordmark or issuer logo; invoice title (`INVOICE` / `FACTURE` per locale); invoice `#`, issue date, due date; status pill.
2. **Parties** — two columns: **From** (fpswagg legal block) and **Bill to** (client). Optional **Ship to**.
3. **Meta row** — payment terms, PO number, currency code (ISO 4217), locale.
4. **Line items table** — primary data surface (see below).
5. **Totals stack** — right-aligned block; subtotal → discounts → tax lines → **total due**.
6. **Points block** — optional; appears **after** monetary total (see Points).
7. **Payment** — methods, bank details, payment link QR (Amber 500 frame when QR shown).
8. **Notes / terms** — Inter body; smaller size; Mist 400 for boilerplate.
9. **Footer** — page x of y (print), issuer registration lines, `Generated by facture`.

### Line items table (required pattern)

| Column | Align | Font | Notes |
|--------|-------|------|--------|
| `#` | center | mono | optional; hide on narrow print |
| Description | left | Inter | primary line + optional muted subline (SKU, period) |
| Qty | right | tabular mono | integers or 2 dp per product rules |
| Unit | right | tabular mono | currency symbol outside cell or in header |
| Rate | right | tabular mono | unit price before tax |
| Tax % | right | tabular mono | optional column; hide if single tax in footer |
| Amount | right | tabular mono | **bold** on row total |

- Header row: Pine 900 (light) / Pine 700 fill (dark app chrome); Bone or Bone 50 text.
- Body: 1px `--border` horizontal rules; zebra `--table-stripe` optional in app, **off in print** unless contrast passes.
- Group rows: Space Grotesk 600 section label spanning columns (e.g. `Services`, `Hardware`).
- Empty state: `No line items. Add a row to continue.` — not decorative illustration on critical path.

### Totals stack (calculation order)

Display in this order; hide rows with zero value:

1. **Subtotal** — sum of line amounts before invoice-level discount
2. **Discount** — negative amount; Amber 500 label if shown as savings
3. **Tax** — one row per rate or single aggregated row
4. **Shipping / fees** — optional
5. **Total due** — largest type in stack (Space Grotesk 700); Pine 900 (light) or Bone on Pine fill (dark)
6. **Amount paid** / **Balance due** — when partial payments exist

Rules:

- One decimal strategy per invoice (e.g. 2 dp for XOF/USD/EUR); round per line or per invoice — **pick one, document in app settings, never mix silently**.
- Negative lines: show minus sign; danger color only on net credit rows, not every discount cell.

### Points block (loyalty / rewards)

Rendered **below** the money total, separated by 2px Pine 700 (light) or Teal 500 (dark accent) rule:

```
POINTS
Earned this invoice     +120
Redeemed                −50
Balance                 1,240
```

- Labels: Inter 500; values: tabular mono, right-aligned in a mini two-column grid.
- Earned: Teal 500 or Pine 500; redeemed: Amber 500; balance: default text.
- Points are **not currency** unless explicitly converted — if conversion exists, show rate in muted footnote (`100 pts = 1 unit`).
- Do not fold points into **Total due** without an explicit “Points applied” money line.

### Optional features (UI + document)

| Feature | Placement | Style note |
|---------|-----------|------------|
| Partial payments | Totals stack + timeline in app | Amber 500 for open balance |
| Recurring badge | Header meta | Teal outline pill |
| Attachments | Below notes | mono filenames, outline buttons |
| Signature line | Footer | dashed Ink 100 / Ink 600 rule |
| QR pay | Payment section | Amber 500 2px frame; caption `Scan to pay.` |
| Multi-currency | Meta row | mono ISO code; never mix symbols in one column |
| Tax ID / VAT | Parties block | mono |
| Version history | App only | log style; not on PDF |

---

## UI guidelines (app chrome)

### Visual language

- Corners: 0–4px; **0** on invoice preview “paper” and tables.
- Borders: 1–2px solid; double border for selected invoice card (outer Pine 700 / inner Ink 600).
- Elevation: no soft shadows; inset 1px highlight for pressed buttons.
- Focus: Teal 300 ring `0 0 0 3px` at ~25% opacity on inputs and primary actions.

### Components

- **Button**: primary (Pine fill, Bone text), secondary (outline), ghost, danger (void/delete — sparingly).
- **Input**: Inter labels; mono for invoice #, amounts; inline validation in danger semantic.
- **Data table** (list view): same column rules as invoice lines; sticky header; row actions at end.
- **Status pill**: maps to invoice status table; label always visible.
- **Toast**: semantic tint + border; no mascots.
- **PDF / print**: force light theme; Bone 50 background; hide app nav; preserve table alignment.

### Motion

- Transitions: 120–200ms `ease-out`.
- Status changes: instant swap on pills; fade only for non-status panels.
- Saving draft: blinking block cursor in footer bar, not a spinner.

### Accessibility

- AA contrast on all body and amount text.
- Status: color + label; table headers associated with `scope="col"`.
- Screen readers: announce total due after line table summary.

---

## Voice and tone

### Principles

- Amounts are facts. Labels are short.
- No exclamation marks in system strings, PDF boilerplate, or API messages.
- French UI copy may use `Facture`, `Échéance`, `TVA` where product is localized; error codes stay English `UPPER_SNAKE_CASE`.

### Patterns

- **Buttons**: `Issue invoice`, `Record payment`, `Download PDF`, `Void`, `Add line`.
- **Empty states**: `No invoices. Create one to bill a client.`
- **Errors**: PascalCase + `Error` — `ValidationError`, `InvoiceNotFoundError`.
- **Error codes**: `UPPER_SNAKE_CASE` — e.g. `LINE_ITEM_INVALID`, `TOTAL_MISMATCH`, `POINTS_INSUFFICIENT`, `PDF_RENDER_FAILED`.
- **Logs**: `facture action { invoiceId, clientId }` — e.g. `facture issue { invoiceId, total, currency }`.

---

## Code conventions

- **TypeScript** preferred for app and PDF generators.
- Import order: Node built-ins → third-party → internal modules → internal types.
- Exported API above file-local helpers; helpers at bottom of file.
- Money: store minor units (integer) or decimal strings — **never float** for totals.
- Invoice IDs, client refs: monospace in UI; validate in one schema module.

### Naming

- Files: `camelCase` or purpose names (`invoiceTotals.ts`, `lineItemsTable.tsx`).
- Types: `PascalCase` — `Invoice`, `LineItem`, `PointsLedgerEntry`.
- Routes: REST plural `invoices`, `invoices/:id/payments`.

### Comments

- Document rounding rules, tax inclusive/exclusive mode, and points earn formulas where non-obvious.

---

## Documentation conventions

- Sections start at `##` in repo docs.
- No emojis in docs or code comments.
- Code fences declare language.
- Link repo files with full paths in markdown.

---

## Asset checklist

- Favicon: 16, 32, 192, 512 px — `f` monogram
- Open Graph: 1200×630, Bone 50, pixel wordmark + sample table fragment
- PDF font embedding: Inter, Space Grotesk, JetBrains Mono subsets
- Design tokens JSON: colors, spacing, radii, type stacks, table column widths
- Print stylesheet: `@page` margins, avoid row breaks inside `tr` where possible

---

## Out of scope

- Payment processor integration specifics
- Legal tax advice per jurisdiction
- Raster logo production (spec only here)
