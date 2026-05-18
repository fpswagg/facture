import type { TFunction } from "i18next";
import { z } from "zod";

export interface LineItemInput {
  id: string;
  service: string;
  description: string;
  amount: number;
  children: LineItemInput[];
}

export interface InvoiceFormValues {
  invoiceNumber: string;
  issueDate: string;
  showDueDate: boolean;
  dueDate: string;
  currency: string;
  projectRef: string;
  fromName: string;
  fromEmail: string;
  fromAddress: string;
  showClient: boolean;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  notes: string;
  terms: string;
  paymentDetails: string;
  showClientSignature: boolean;
  showMySignature: boolean;
}

export interface CalculatedLineItem {
  id: string;
  service: string;
  description: string;
  amount: number;
  depth: number;
  isParent: boolean;
  total: number;
  children: CalculatedLineItem[];
}

export interface InvoiceCalculation {
  lines: CalculatedLineItem[];
  subtotal: number;
  totalDue: number;
}

export const createInvoiceFormSchema = (t: TFunction) =>
  z
    .object({
      invoiceNumber: z.string().trim().min(1, t("validation.invoiceNumberRequired")),
      issueDate: z.string().min(1, t("validation.issueDateRequired")),
      showDueDate: z.boolean(),
      dueDate: z.string().trim(),
      currency: z.string().trim().min(3).max(3),
      projectRef: z.string().trim(),
      fromName: z.string().trim().min(1, t("validation.fromNameRequired")),
      fromEmail: z.string().trim().email(t("validation.fromEmailInvalid")),
      fromAddress: z.string().trim().min(1, t("validation.fromAddressRequired")),
      showClient: z.boolean(),
      clientName: z.string().trim(),
      clientEmail: z.string().trim(),
      clientAddress: z.string().trim(),
      notes: z.string().trim(),
      terms: z.string().trim(),
      paymentDetails: z.string().trim(),
      showClientSignature: z.boolean(),
      showMySignature: z.boolean(),
    })
    .refine((data) => !data.showDueDate || data.dueDate.length > 0, {
      message: t("validation.dueDateRequired"),
      path: ["dueDate"],
    });
