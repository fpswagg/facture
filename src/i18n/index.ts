import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import fr from "./locales/fr.json";

export const LANGUAGE_STORAGE_KEY = "facture:language";
export const DEFAULT_LANGUAGE = "fr";
export const SUPPORTED_LANGUAGES = ["fr", "en"] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
const initialLanguage: AppLanguage =
  storedLanguage === "en" || storedLanguage === "fr" ? storedLanguage : DEFAULT_LANGUAGE;

void i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    en: { translation: en },
  },
  lng: initialLanguage,
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: {
    escapeValue: false,
  },
});

export const setAppLanguage = (language: AppLanguage): void => {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  void i18n.changeLanguage(language);
};

export const getIntlLocale = (language: string): string => (language === "fr" ? "fr-FR" : "en-US");

export default i18n;
