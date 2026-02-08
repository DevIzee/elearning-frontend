/**
 * OAuth Error Page
 *
 * Affiche les erreurs OAuth et redirige vers login
 *
 * ✅ Support i18n
 * ✅ Support dark mode
 * ✅ Icônes composants
 */

"use client";

import { ErrorIcon } from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function OAuthErrorPage() {
  const t = useTranslations("auth.error");
  const searchParams = useSearchParams();
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  // Récupérer les détails de l'erreur
  const errorType = searchParams.get("error") || "unknown_error";
  const errorMessage =
    searchParams.get("message") || t("unknownErrorDescription");

  /**
   * Redirection automatique après 5 secondes
   */
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/auth/login");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  /**
   * Messages d'erreur personnalisés (traduits)
   */
  const getErrorTitle = () => {
    switch (errorType) {
      case "invalid_provider":
        return t("invalidProvider");
      case "oauth_failed":
        return t("oauthFailed");
      case "access_denied":
        return t("accessDenied");
      default:
        return t("unknownError");
    }
  };

  const getErrorDescription = () => {
    switch (errorType) {
      case "invalid_provider":
        return t("invalidProviderDescription");
      case "oauth_failed":
        return t("oauthFailedDescription");
      case "access_denied":
        return t("accessDeniedDescription");
      default:
        return t("unknownErrorDescription");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <ErrorIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400">
            {getErrorTitle()}
          </CardTitle>
          <CardDescription className="mt-2">
            {getErrorDescription()}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Détails de l'erreur */}
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 p-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("errorDetails")}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 wrap-break-word">
              {errorMessage}
            </p>
          </div>

          {/* Countdown */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            {t("redirectingIn")}{" "}
            <span className="font-semibold">{countdown}</span> {t("seconds")}
          </p>
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <Button onClick={() => router.push("/auth/login")} className="w-full">
            {t("goToLoginNow")}
          </Button>
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="w-full dark:border-gray-700 dark:hover:bg-gray-800"
          >
            {t("goToHome")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
