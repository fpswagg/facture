import { z } from "zod";
import { createId } from "./utils";
import type { InvoiceDraft } from "./storage";
import type { InvoiceFormValues, LineItemInput } from "../types/invoice";

export const INVOICE_JSON_FORMAT = "facture.invoice" as const;
export const INVOICE_JSON_VERSION = "1.0" as const;

export type InvoiceJsonErrorCode =
  | "invalid_json"
  | "invalid_structure"
  | "unsupported_version"
  | "validation_failed";

export interface InvoiceDocument {
  format: typeof INVOICE_JSON_FORMAT;
  version: typeof INVOICE_JSON_VERSION;
  exportedAt: string;
  form: InvoiceFormValues;
  lineItems: LineItemInput[];
}

const lineItemSchema: z.ZodType<LineItemInput> = z.lazy(() =>
  z.object({
    id: z.string(),
    service: z.string(),
    description: z.string(),
    amount: z.number(),
    children: z.array(lineItemSchema),
  }),
);

const formSchema = z
  .object({
    invoiceNumber: z.string(),
    issueDate: z.string(),
    showDueDate: z.boolean(),
    dueDate: z.string(),
    currency: z.string(),
    projectRef: z.string(),
    fromName: z.string(),
    fromEmail: z.string(),
    fromAddress: z.string(),
    showClient: z.boolean(),
    clientName: z.string(),
    clientEmail: z.string(),
    clientAddress: z.string(),
    notes: z.string(),
    terms: z.string(),
    paymentDetails: z.string(),
    showClientSignature: z.boolean().optional(),
    showMySignature: z.boolean().optional(),
  })
  .passthrough();

const documentSchema = z.object({
  format: z.literal(INVOICE_JSON_FORMAT),
  version: z.literal(INVOICE_JSON_VERSION),
  exportedAt: z.string(),
  form: formSchema,
  lineItems: z.array(lineItemSchema).min(1),
});

const parseLegacyLineItem = (raw: unknown): LineItemInput | null => {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const line = raw as Record<string, unknown>;
  const quantity = typeof line.quantity === "number" ? line.quantity : 1;
  const unitPrice = typeof line.unitPrice === "number" ? line.unitPrice : 0;
  const amount =
    typeof line.amount === "number"
      ? line.amount
      : Math.round((quantity * unitPrice + Number.EPSILON) * 100) / 100;

  const childrenRaw = Array.isArray(line.children) ? line.children : [];
  const children: LineItemInput[] = [];

  for (const child of childrenRaw) {
    const parsedChild = parseLegacyLineItem(child);
    if (parsedChild) {
      children.push(parsedChild);
    }
  }

  return {
    id: typeof line.id === "string" && line.id ? line.id : createId(),
    service: typeof line.service === "string" ? line.service : "",
    description: typeof line.description === "string" ? line.description : "",
    amount,
    children,
  };
};

const parseLegacyLineItems = (raw: unknown): LineItemInput[] | null => {
  if (!Array.isArray(raw) || raw.length === 0) {
    return null;
  }

  const items: LineItemInput[] = [];
  for (const entry of raw) {
    const parsed = parseLegacyLineItem(entry);
    if (!parsed) {
      return null;
    }
    items.push(parsed);
  }

  return items;
};

const normalizeForm = (raw: z.infer<typeof formSchema>): InvoiceFormValues => ({
  invoiceNumber: raw.invoiceNumber ?? "",
  issueDate: raw.issueDate ?? new Date().toISOString().slice(0, 10),
  showDueDate: raw.showDueDate ?? Boolean(raw.dueDate),
  dueDate: raw.dueDate ?? "",
  currency: (raw.currency ?? "USD").toUpperCase().slice(0, 3),
  projectRef: raw.projectRef ?? "",
  fromName: raw.fromName ?? "",
  fromEmail: raw.fromEmail ?? "",
  fromAddress: raw.fromAddress ?? "",
  showClient: raw.showClient ?? true,
  clientName: raw.clientName ?? "",
  clientEmail: raw.clientEmail ?? "",
  clientAddress: raw.clientAddress ?? "",
  notes: raw.notes ?? "",
  terms: raw.terms ?? "",
  paymentDetails: raw.paymentDetails ?? "",
  showClientSignature: raw.showClientSignature ?? false,
  showMySignature: raw.showMySignature ?? false,
});

const ensureLineIds = (items: LineItemInput[]): LineItemInput[] =>
  items.map((item) => ({
    ...item,
    id: item.id || createId(),
    children: ensureLineIds(item.children),
  }));

export const buildInvoiceDocument = (
  formValues: InvoiceFormValues,
  lineItems: LineItemInput[],
): InvoiceDocument => ({
  format: INVOICE_JSON_FORMAT,
  version: INVOICE_JSON_VERSION,
  exportedAt: new Date().toISOString(),
  form: formValues,
  lineItems,
});

export const serializeInvoiceDocument = (document: InvoiceDocument): string =>
  JSON.stringify(document, null, 2);

export type ParseInvoiceResult =
  | { ok: true; draft: InvoiceDraft }
  | { ok: false; code: InvoiceJsonErrorCode; detail?: string };

export const parseInvoiceJson = (raw: string): ParseInvoiceResult => {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, code: "invalid_json" };
  }

  if (!parsed || typeof parsed !== "object") {
    return { ok: false, code: "invalid_structure" };
  }

  const record = parsed as Record<string, unknown>;

  if (record.format === INVOICE_JSON_FORMAT) {
    if (record.version !== INVOICE_JSON_VERSION) {
      return { ok: false, code: "unsupported_version" };
    }

    const result = documentSchema.safeParse(parsed);
    if (!result.success) {
      return { ok: false, code: "validation_failed", detail: result.error.message };
    }

    return {
      ok: true,
      draft: {
        formValues: normalizeForm(result.data.form),
        lineItems: ensureLineIds(result.data.lineItems),
      },
    };
  }

  if ("formValues" in record && "lineItems" in record) {
    const legacyForm = formSchema.safeParse(record.formValues);
    const legacyLines = parseLegacyLineItems(record.lineItems);

    if (!legacyForm.success || !legacyLines) {
      return { ok: false, code: "validation_failed" };
    }

    return {
      ok: true,
      draft: {
        formValues: normalizeForm(legacyForm.data),
        lineItems: ensureLineIds(legacyLines),
      },
    };
  }

  return { ok: false, code: "invalid_structure" };
};

export const importErrorMessage = (
  t: (key: string) => string,
  code: InvoiceJsonErrorCode,
): string => {
  switch (code) {
    case "invalid_json":
      return t("actions.importErrorInvalidJson");
    case "unsupported_version":
      return t("actions.importErrorUnsupportedVersion");
    case "validation_failed":
      return t("actions.importErrorValidation");
    default:
      return t("actions.importErrorStructure");
  }
};

export const downloadInvoiceJson = (
  formValues: InvoiceFormValues,
  lineItems: LineItemInput[],
): void => {
  const invoiceDoc = buildInvoiceDocument(formValues, lineItems);
  const blob = new Blob([serializeInvoiceDocument(invoiceDoc)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = window.document.createElement("a");
  const safeNumber = formValues.invoiceNumber.replace(/[^\w.-]+/g, "_") || "invoice";
  anchor.href = url;
  anchor.download = `facture-${safeNumber}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
};
