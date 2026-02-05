/**
 * Configuration i18n
 *
 * Langues supportées et configuration pour next-intl
 */

export const locales = ["en", "fr"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";
