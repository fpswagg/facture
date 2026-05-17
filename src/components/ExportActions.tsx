import { useRef } from "react";
import { useTranslation } from "react-i18next";
interface ExportActionsProps {
  onReset: () => void;
  onClearDraft: () => void;
  onExportJson: () => void;
  onImportJson: (file: File) => void;
  lastSavedAt: string | null;
  importMessage: string | null;
  importMessageKind: "success" | "error" | null;
}

export const ExportActions = ({
  onReset,
  onClearDraft,
  onExportJson,
  onImportJson,
  lastSavedAt,
  importMessage,
  importMessageKind,
}: ExportActionsProps) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImportJson(file);
    }
    event.target.value = "";
  };

  return (
    <section className="panel actionPanel noPrint">
      <div className="panelHeader">
        <h3>{t("actions.title")}</h3>
      </div>
      <div className="actionGrid">
        <button type="button" onClick={() => window.print()}>
          {t("actions.exportPdf")}
        </button>
        <button type="button" onClick={onExportJson}>
          {t("actions.exportJson")}
        </button>
        <button type="button" onClick={() => fileInputRef.current?.click()}>
          {t("actions.importJson")}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="srOnly"
          onChange={handleFileChange}
          aria-label={t("actions.importJson")}
        />
        <button type="button" onClick={onReset}>
          {t("actions.resetForm")}
        </button>
        <button type="button" className="dangerButton" onClick={onClearDraft}>
          {t("actions.clearDraft")}
        </button>
      </div>
      {importMessage ? (
        <p
          className={
            importMessageKind === "success" ? "importFeedback importSuccess" : "importFeedback importError"
          }
          role="status"
        >
          {importMessage}
        </p>
      ) : null}
      <p className="savedMeta">
        {t("actions.lastSave")}: <strong>{lastSavedAt ?? t("actions.notSavedYet")}</strong>
      </p>
    </section>
  );
};
