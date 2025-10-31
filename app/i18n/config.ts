// app/i18n/config.ts
export const locales = ["am", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "am";

export const localeNames: Record<Locale, string> = {
  am: "አማርኛ",
  en: "English",
};

export const localeFlags: Record<Locale, string> = {
  am: "🇪🇹",
  en: "🇺🇸",
};

export function isValidLocale(locale: unknown): locale is Locale {
  return typeof locale === "string" && locales.includes(locale as Locale);
}
