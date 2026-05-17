import type {
  CalculatedLineItem,
  InvoiceCalculation,
  InvoiceFormValues,
  LineItemInput,
} from "../types/invoice";

const roundCurrency = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;

const sanitizeNumber = (value: number): number => (Number.isFinite(value) ? value : 0);

const calcLeaf = (item: LineItemInput, depth: number): CalculatedLineItem => {
  const amount = roundCurrency(sanitizeNumber(item.amount));
  const total = amount;

  return {
    id: item.id,
    service: item.service,
    description: item.description,
    amount,
    depth,
    isParent: false,
    total,
    children: [],
  };
};

const calcLine = (item: LineItemInput, depth: number): CalculatedLineItem => {
  if (item.children.length === 0) {
    return calcLeaf(item, depth);
  }

  const children = item.children.map((child) => calcLine(child, depth + 1));
  const total = roundCurrency(children.reduce((sum, child) => sum + child.total, 0));

  return {
    id: item.id,
    service: item.service,
    description: item.description,
    amount: total,
    depth,
    isParent: true,
    total,
    children,
  };
};

export const calculateInvoice = (
  _formValues: InvoiceFormValues,
  lineItems: LineItemInput[],
): InvoiceCalculation => {
  const lines = lineItems.map((line) => calcLine(line, 0));
  const subtotal = roundCurrency(lines.reduce((sum, line) => sum + line.total, 0));
  const totalDue = subtotal;

  return {
    lines,
    subtotal,
    totalDue,
  };
};

export const formatCurrency = (currency: string, value: number, locale?: string): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency.toUpperCase(),
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency.toUpperCase()} ${value.toFixed(2)}`;
  }
};
