// Third-party dependencies
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

// Internal modules
import { ExportActions } from "./components/ExportActions";
import { InvoiceForm } from "./components/InvoiceForm";
import { InvoicePreview } from "./components/InvoicePreview";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { LineItemsEditor } from "./components/LineItemsEditor";
import { downloadInvoiceJson, importErrorMessage, parseInvoiceJson } from "./lib/invoiceJson";
import { createId, portfolioUrl } from "./lib/utils";
import { getIntlLocale } from "./i18n";
import { getDefaultFormValues } from "./lib/defaults";
import { calculateInvoice } from "./lib/invoiceMath";
import { clearDraft, loadDraft, saveDraft } from "./lib/storage";

// Internal types
import { createInvoiceFormSchema, type InvoiceFormValues, type LineItemInput } from "./types/invoice";

const createDefaultLine = (): LineItemInput => ({
  id: createId(),
  service: "",
  description: "",
  amount: 0,
  children: [],
});

const App = () => {
  const { t, i18n } = useTranslation();
  const language = i18n.language === "en" ? "en" : "fr";
  const intlLocale = getIntlLocale(language);

  const invoiceFormSchema = useMemo(() => createInvoiceFormSchema(t), [t]);
  const defaultValues = useMemo(() => getDefaultFormValues(t, language), [t, language]);

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const [lineItems, setLineItems] = useState<LineItemInput[]>([createDefaultLine()]);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [importMessageKind, setImportMessageKind] = useState<"success" | "error" | null>(null);

  const formValues = useWatch({ control: form.control }) as InvoiceFormValues;

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = t("app.name");
  }, [language, t]);

  useEffect(() => {
    const draft = loadDraft();
    if (!draft) {
      return;
    }

    form.reset(draft.formValues);
    setLineItems(draft.lineItems.length > 0 ? draft.lineItems : [createDefaultLine()]);
    setLastSavedAt(t("storage.recovered"));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load draft once on mount
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const values = form.getValues();
      saveDraft({ formValues: values, lineItems });
      setLastSavedAt(new Date().toLocaleTimeString(intlLocale));
    }, 450);

    return () => window.clearTimeout(timeout);
  }, [form, formValues, lineItems, intlLocale]);

  useEffect(() => {
    if (!importMessage) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setImportMessage(null);
      setImportMessageKind(null);
    }, 5000);

    return () => window.clearTimeout(timeout);
  }, [importMessage]);

  const resolvedFormValues = formValues ?? form.getValues();
  const calculation = useMemo(
    () => calculateInvoice(resolvedFormValues, lineItems),
    [resolvedFormValues, lineItems],
  );

  const resetAll = () => {
    form.reset(getDefaultFormValues(t, language));
    setLineItems([createDefaultLine()]);
  };

  const clearDraftData = () => {
    clearDraft();
    setLastSavedAt(t("storage.cleared"));
  };

  const handleExportJson = () => {
    downloadInvoiceJson(form.getValues(), lineItems);
    setImportMessage(null);
    setImportMessageKind(null);
  };

  const handleImportJson = async (file: File) => {
    try {
      const text = await file.text();
      const result = parseInvoiceJson(text);

      if (!result.ok) {
        setImportMessage(importErrorMessage(t, result.code));
        setImportMessageKind("error");
        return;
      }

      form.reset(result.draft.formValues);
      setLineItems(
        result.draft.lineItems.length > 0 ? result.draft.lineItems : [createDefaultLine()],
      );
      saveDraft(result.draft);
      setLastSavedAt(new Date().toLocaleTimeString(intlLocale));
      setImportMessage(t("actions.importSuccess"));
      setImportMessageKind("success");
    } catch {
      setImportMessage(t("actions.importErrorStructure"));
      setImportMessageKind("error");
    }
  };

  return (
    <div className="appRoot">
      <header className="appHeader noPrint">
        <div>
          <p className="wordmark">{t("app.wordmark")}</p>
          <p className="brandSubline">{t("app.brandSubline")}</p>
        </div>
        <div className="headerActions">
          <p className="headerHint">{t("app.headerHint")}</p>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="appGrid">
        <section className="editorPane noPrint">
          <InvoiceForm form={form} />
          <LineItemsEditor
            items={lineItems}
            calculatedLines={calculation.lines}
            currency={resolvedFormValues.currency}
            locale={intlLocale}
            onChange={setLineItems}
          />
          <ExportActions
            onReset={resetAll}
            onClearDraft={clearDraftData}
            onExportJson={handleExportJson}
            onImportJson={handleImportJson}
            lastSavedAt={lastSavedAt}
            importMessage={importMessage}
            importMessageKind={importMessageKind}
          />
        </section>

        <section className="previewPane">
          <InvoicePreview
            formValues={resolvedFormValues}
            calculation={calculation}
            portfolioUrl={portfolioUrl}
            locale={intlLocale}
          />
        </section>
      </main>
    </div>
  );
};

export default App;
