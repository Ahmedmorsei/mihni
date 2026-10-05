// Supported locales for the app. Add a new code here + a matching
// src/messages/<code>.json file to add a language.
export const locales = ["ar", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ar";

export const localeNames: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
};
