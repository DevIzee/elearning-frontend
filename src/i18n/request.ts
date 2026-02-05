/**
 * Configuration i18n request
 *
 * Nécessaire pour Next.js App Router avec next-intl
 */

import { getRequestConfig } from "next-intl/server";
import { locales } from "./config";

export default getRequestConfig(async ({ requestLocale }) => {
  // Récupérer la locale depuis la requête
  let locale = await requestLocale;

  // Vérifier que la locale est supportée
  if (!locale || !locales.includes(locale as "en" | "fr")) {
    locale = "en";
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
