import type { TFunction } from "i18next";
import type { InvoiceFormValues } from "../types/invoice";

export const getDefaultFormValues = (t: TFunction, language: string): InvoiceFormValues => ({
  invoiceNumber: `${language === "fr" ? "FAC" : "INV"}-${new Date().getFullYear()}-001`,
  issueDate: new Date().toISOString().slice(0, 10),
  showDueDate: false,
  dueDate: "",
  currency: "USD",
  projectRef: "",
  fromName: "fpswagg",
  fromEmail: "billing@fpswagg.com",
  fromAddress: t("defaults.fromAddress"),
  showClient: true,
  clientName: "",
  clientEmail: "",
  clientAddress: "",
  notes: t("defaults.notes"),
  terms: t("defaults.terms"),
  paymentDetails: t("defaults.paymentDetails"),
  showClientSignature: false,
  showMySignature: false,
});
