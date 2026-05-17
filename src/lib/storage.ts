import type { InvoiceFormValues, LineItemInput } from "../types/invoice";

const STORAGE_KEY_V2 = "facture:draft:v2";
const STORAGE_KEY_V1 = "facture:draft:v1";

export interface InvoiceDraft {
  formValues: InvoiceFormValues;
  lineItems: LineItemInput[];
}

interface LegacyLineItem {
  id: string;
  service: string;
  description: string;
  quantity?: number;
  unitPrice?: number;
  amount?: number;
  taxRate?: number;
  discountRate?: number;
  children?: LegacyLineItem[];
}

interface LegacyFormValues {
  invoiceNumber?: string;
  issueDate?: string;
  dueDate?: string;
  showDueDate?: boolean;
  currency?: string;
  projectRef?: string;
  fromName?: string;
  fromEmail?: string;
  fromAddress?: string;
  showClient?: boolean;
  clientName?: string;
  clientEmail?: string;
  clientAddress?: string;
  notes?: string;
  terms?: string;
  paymentDetails?: string;
}

const migrateLine = (line: LegacyLineItem): LineItemInput => {
  const quantity = line.quantity ?? 1;
  const unitPrice = line.unitPrice ?? 0;
  const amount =
    line.amount !== undefined ? line.amount : roundCurrency(quantity * unitPrice);

  return {
    id: line.id,
    service: line.service ?? "",
    description: line.description ?? "",
    amount,
    children: (line.children ?? []).map(migrateLine),
  };
};

const roundCurrency = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;

const migrateFormValues = (legacy: LegacyFormValues): InvoiceFormValues => {
  const hadDueDate = Boolean(legacy.dueDate && legacy.dueDate.length > 0);

  return {
    invoiceNumber: legacy.invoiceNumber ?? "",
    issueDate: legacy.issueDate ?? new Date().toISOString().slice(0, 10),
    showDueDate: legacy.showDueDate ?? hadDueDate,
    dueDate: legacy.dueDate ?? "",
    currency: legacy.currency ?? "USD",
    projectRef: legacy.projectRef ?? "",
    fromName: legacy.fromName ?? "",
    fromEmail: legacy.fromEmail ?? "",
    fromAddress: legacy.fromAddress ?? "",
    showClient: legacy.showClient ?? true,
    clientName: legacy.clientName ?? "",
    clientEmail: legacy.clientEmail ?? "",
    clientAddress: legacy.clientAddress ?? "",
    notes: legacy.notes ?? "",
    terms: legacy.terms ?? "",
    paymentDetails: legacy.paymentDetails ?? "",
  };
};

const parseDraft = (raw: string): InvoiceDraft | null => {
  try {
    const parsed = JSON.parse(raw) as {
      formValues: LegacyFormValues;
      lineItems: LegacyLineItem[];
    };

    if (!parsed.formValues || !Array.isArray(parsed.lineItems)) {
      return null;
    }

    return {
      formValues: migrateFormValues(parsed.formValues),
      lineItems: parsed.lineItems.map(migrateLine),
    };
  } catch {
    return null;
  }
};

export const saveDraft = (draft: InvoiceDraft): void => {
  localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(draft));
};

export const loadDraft = (): InvoiceDraft | null => {
  const v2 = localStorage.getItem(STORAGE_KEY_V2);
  if (v2) {
    return parseDraft(v2);
  }

  const v1 = localStorage.getItem(STORAGE_KEY_V1);
  if (v1) {
    const migrated = parseDraft(v1);
    if (migrated) {
      saveDraft(migrated);
      localStorage.removeItem(STORAGE_KEY_V1);
    }
    return migrated;
  }

  return null;
};

export const clearDraft = (): void => {
  localStorage.removeItem(STORAGE_KEY_V2);
  localStorage.removeItem(STORAGE_KEY_V1);
};
