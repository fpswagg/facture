import { useTranslation } from "react-i18next";
import { setAppLanguage, type AppLanguage } from "../i18n";

export const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();
  const current = i18n.language === "en" ? "en" : "fr";

  const onChange = (language: AppLanguage) => {
    setAppLanguage(language);
  };

  return (
    <div className="languageSwitcher">
      <label htmlFor="language-select">{t("app.language")}</label>
      <select
        id="language-select"
        value={current}
        onChange={(event) => onChange(event.target.value as AppLanguage)}
        aria-label={t("a11y.languageSwitcher")}
      >
        <option value="fr">{t("app.languageFr")}</option>
        <option value="en">{t("app.languageEn")}</option>
      </select>
    </div>
  );
};
