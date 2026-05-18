import { QRCodeSVG } from "qrcode.react";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "../lib/invoiceMath";
import type { InvoiceCalculation, InvoiceFormValues } from "../types/invoice";

interface InvoicePreviewProps {
  formValues: InvoiceFormValues;
  calculation: InvoiceCalculation;
  portfolioUrl: string;
  locale: string;
}

export const InvoicePreview = ({
  formValues,
  calculation,
  portfolioUrl,
  locale,
}: InvoicePreviewProps) => {
  const { t } = useTranslation();
  const empty = t("common.empty");

  return (
    <section className="invoicePreview panel printPanel">
      <header className="invoiceHeader">
        <div>
          <p className="wordmark">{t("app.wordmark")}</p>
          <p className="brandSubline">{t("app.previewBrandSubline")}</p>
        </div>
        <div className="headerMeta">
          <p className="invoiceTitle">{t("preview.documentTitle")}</p>
          <p>#{formValues.invoiceNumber}</p>
          {formValues.projectRef ? (
            <p>
              {t("preview.projectRef")}: {formValues.projectRef}
            </p>
          ) : null}
          <p>
            {t("preview.issue")}: {formValues.issueDate}
          </p>
          {formValues.showDueDate && formValues.dueDate ? (
            <p>
              {t("preview.due")}: {formValues.dueDate}
            </p>
          ) : null}
        </div>
      </header>

      <section className="partyGrid">
        <article>
          <h4>{t("preview.from")}</h4>
          <p>{formValues.fromName}</p>
          <p>{formValues.fromEmail}</p>
          <p className="preWrap">{formValues.fromAddress}</p>
        </article>
        {formValues.showClient ? (
          <article>
            <h4>{t("preview.billTo")}</h4>
            <p>{formValues.clientName || empty}</p>
            <p>{formValues.clientEmail || empty}</p>
            <p className="preWrap">{formValues.clientAddress || empty}</p>
          </article>
        ) : null}
      </section>

      <section>
        <table className="previewTable">
          <thead>
            <tr>
              <th>{t("preview.service")}</th>
              <th>{t("preview.description")}</th>
              <th>{t("preview.amount")}</th>
            </tr>
          </thead>
          <tbody>
            {calculation.lines.length === 0 ? (
              <tr>
                <td colSpan={3} className="emptyCell">
                  {t("preview.empty")}
                </td>
              </tr>
            ) : (
              calculation.lines.map((line) => (
                <PreviewLine key={line.id} line={line} currency={formValues.currency} locale={locale} />
              ))
            )}
          </tbody>
        </table>
      </section>

      <section className="totalsGrid">
        <div />
        <div className="totalsCard">
          <div>
            <span>{t("preview.subtotal")}</span>
            <strong>{formatCurrency(formValues.currency, calculation.subtotal, locale)}</strong>
          </div>
          <div className="totalDue">
            <span>{t("preview.totalDue")}</span>
            <strong>{formatCurrency(formValues.currency, calculation.totalDue, locale)}</strong>
          </div>
        </div>
      </section>

      <section className="notesGrid">
        <article>
          <h4>{t("preview.notes")}</h4>
          <p className="preWrap">{formValues.notes || empty}</p>
        </article>
        <article>
          <h4>{t("preview.terms")}</h4>
          <p className="preWrap">{formValues.terms || empty}</p>
        </article>
      </section>

      {formValues.showClientSignature || formValues.showMySignature ? (
        <section className="signatureGrid">
          {formValues.showClientSignature ? (
            <article className="signatureBlock">
              <div className="signatureLine" />
              <p className="signatureLabel">
                {formValues.showClient && formValues.clientName
                  ? formValues.clientName
                  : t("preview.clientSignature")}
              </p>
            </article>
          ) : null}
          {formValues.showMySignature ? (
            <article className="signatureBlock">
              <div className="signatureLine" />
              <p className="signatureLabel">{formValues.fromName || t("preview.mySignature")}</p>
            </article>
          ) : null}
        </section>
      ) : null}

      <footer className="invoiceFooter">
        <div className="footerDetails">
          {formValues.paymentDetails ? (
            <div className="paymentBlock">
              <p>{t("preview.paymentDetails")}</p>
              <p className="preWrap">{formValues.paymentDetails}</p>
            </div>
          ) : null}
          <div>
            <p>{t("preview.portfolio")}</p>
            <a href={portfolioUrl} target="_blank" rel="noreferrer">
              {portfolioUrl}
            </a>
          </div>
        </div>
        <QRCodeSVG
          value={portfolioUrl}
          size={84}
          bgColor="transparent"
          fgColor="#0f3d2e"
          aria-label={t("a11y.portfolioQr")}
        />
      </footer>
    </section>
  );
};

interface PreviewLineProps {
  line: InvoiceCalculation["lines"][number];
  currency: string;
  locale: string;
}

const PreviewLine = ({ line, currency, locale }: PreviewLineProps) => {
  const { t } = useTranslation();
  const indent = line.depth * 18;
  const empty = t("common.empty");

  return (
    <>
      <tr>
        <td style={{ paddingLeft: `${indent + 8}px` }}>
          {line.service ||
            (line.depth > 0 ? t("preview.fallbackChildService") : t("preview.fallbackService"))}
          {line.isParent ? <small className="lineTag">{t("preview.groupTag")}</small> : null}
        </td>
        <td>{line.description || empty}</td>
        <td className="numCell">{formatCurrency(currency, line.total, locale)}</td>
      </tr>
      {line.children.map((child) => (
        <PreviewLine key={child.id} line={child} currency={currency} locale={locale} />
      ))}
    </>
  );
};
