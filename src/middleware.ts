/**
 * Middleware i18n
 *
 * Détecte automatiquement la langue de l'utilisateur
 * et ajoute le préfixe de langue dans l'URL (/en/... ou /fr/...)
 */

import createMiddleware from "next-intl/middleware";
import { defaultLocale, locales } from "./i18n/config";

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "as-needed", // Ne préfixe que les langues non-default
});

export const config = {
  // Matcher pour toutes les routes sauf /api, /_next, /favicon.ico
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
