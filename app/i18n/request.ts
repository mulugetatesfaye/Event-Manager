// app/i18n/request.ts
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { isValidLocale } from "./config";

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !isValidLocale(locale)) {
    locale = routing.defaultLocale;
  }

  // After validation, locale is guaranteed to be valid
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    timeZone: "Africa/Addis_Ababa",
    now: new Date(),
  };
});
