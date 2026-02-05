/**
 * Locale Layout
 *
 * Layout pour chaque locale (en, fr)
 * Ce layout est imbriqué dans le root layout
 */

import { locales } from "@/i18n/config";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Vérifier que la locale est valide
  if (!locales.includes(locale as "en" | "fr")) {
    notFound();
  }

  // Charger les messages de traduction
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
