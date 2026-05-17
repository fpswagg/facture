import type { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { InvoiceFormValues } from "../types/invoice";
import { Tooltip } from "./Tooltip";

interface InvoiceFormProps {
  form: UseFormReturn<InvoiceFormValues>;
}

export const InvoiceForm = ({ form }: InvoiceFormProps) => {
  const { t } = useTranslation();
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = form;

  const showClient = watch("showClient");
  const showDueDate = watch("showDueDate");

  return (
    <section className="panel">
      <div className="panelHeader">
        <h3>{t("form.title")}</h3>
      </div>

      <div className="fieldGrid fieldGridThree">
        <label>
          {t("form.invoiceNumber")}
          <input {...register("invoiceNumber")} placeholder={t("form.invoiceNumberPlaceholder")} />
          {errors.invoiceNumber ? <span className="fieldError">{errors.invoiceNumber.message}</span> : null}
        </label>
        <label>
          {t("form.issueDate")}
          <input type="date" {...register("issueDate")} />
          {errors.issueDate ? <span className="fieldError">{errors.issueDate.message}</span> : null}
        </label>
        <label>
          {t("form.currency")}
          <input {...register("currency")} maxLength={3} placeholder={t("form.currencyPlaceholder")} />
        </label>
      </div>

      <label>
        {t("form.projectRef")}
        <input {...register("projectRef")} placeholder={t("form.projectRefPlaceholder")} />
      </label>

      <div className="clientToggle">
        <label className="toggleLabel">
          <input
            type="checkbox"
            checked={showDueDate}
            onChange={(event) => {
              const checked = event.target.checked;
              setValue("showDueDate", checked);
              if (!checked) {
                setValue("dueDate", "");
              }
            }}
          />
          {t("form.showDueDate")}
        </label>
        <Tooltip label="?" text={t("form.showDueDateTooltip")} />
      </div>

      {showDueDate ? (
        <label>
          {t("form.dueDate")}
          <input type="date" {...register("dueDate")} />
          {errors.dueDate ? <span className="fieldError">{errors.dueDate.message}</span> : null}
        </label>
      ) : null}

      <h4 className="sectionHeading">{t("form.from")}</h4>
      <div className="fieldGrid fieldGridTwo">
        <label>
          {t("form.senderName")}
          <input {...register("fromName")} placeholder={t("form.senderNamePlaceholder")} />
          {errors.fromName ? <span className="fieldError">{errors.fromName.message}</span> : null}
        </label>
        <label>
          {t("form.senderEmail")}
          <input type="email" {...register("fromEmail")} placeholder={t("form.senderEmailPlaceholder")} />
          {errors.fromEmail ? <span className="fieldError">{errors.fromEmail.message}</span> : null}
        </label>
      </div>
      <label>
        {t("form.senderAddress")}
        <textarea rows={2} {...register("fromAddress")} placeholder={t("form.senderAddressPlaceholder")} />
        {errors.fromAddress ? <span className="fieldError">{errors.fromAddress.message}</span> : null}
      </label>

      <div className="clientToggle">
        <label className="toggleLabel">
          <input
            type="checkbox"
            checked={showClient}
            onChange={(event) => {
              setValue("showClient", event.target.checked);
            }}
          />
          {t("form.showClient")}
        </label>
        <Tooltip label="?" text={t("form.showClientTooltip")} />
      </div>

      {showClient ? (
        <>
          <h4 className="sectionHeading">{t("form.client")}</h4>
          <div className="fieldGrid fieldGridTwo">
            <label>
              {t("form.clientName")}
              <input {...register("clientName")} placeholder={t("form.clientNamePlaceholder")} />
            </label>
            <label>
              {t("form.clientEmail")}
              <input type="email" {...register("clientEmail")} placeholder={t("form.clientEmailPlaceholder")} />
            </label>
          </div>
          <label>
            {t("form.clientAddress")}
            <textarea rows={2} {...register("clientAddress")} placeholder={t("form.clientAddressPlaceholder")} />
          </label>
        </>
      ) : null}

      <h4 className="sectionHeading">{t("form.notesAndTerms")}</h4>
      <label>
        {t("form.notes")}
        <textarea rows={2} {...register("notes")} placeholder={t("form.notesPlaceholder")} />
      </label>
      <label>
        {t("form.terms")}
        <textarea rows={2} {...register("terms")} placeholder={t("form.termsPlaceholder")} />
      </label>
      <label>
        {t("form.paymentDetails")}
        <textarea rows={3} {...register("paymentDetails")} placeholder={t("form.paymentDetailsPlaceholder")} />
      </label>
    </section>
  );
};
