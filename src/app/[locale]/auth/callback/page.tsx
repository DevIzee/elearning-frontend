/**
 * OAuth Callback Page
 *
 * Traite le retour OAuth et redirige vers le dashboard
 * - Récupère les tokens depuis l'URL
 * - Les stocke dans les cookies
 * - Redirige vers /dashboard
 *
 * ✅ Support i18n
 * ✅ Support dark mode
 * ✅ Icônes composants
 */

"use client";

import {
  ErrorIcon,
  LoadingSpinner,
  SuccessIcon,
} from "@/components/icons/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Cookies from "js-cookie";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function OAuthCallbackPage() {
  const t = useTranslations("auth.callback");
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"processing" | "success" | "error">(
    "processing",
  );
  const [message, setMessage] = useState("");

  /**
   * Traiter les paramètres OAuth au chargement
   */
  useEffect(() => {
    const handleCallback = async () => {
      // Récupérer les paramètres de l'URL
      const accessToken = searchParams.get("access_token");
      const refreshToken = searchParams.get("refresh_token");
      const userEncoded = searchParams.get("user");

      // Vérifier que tous les paramètres sont présents
      if (!accessToken || !refreshToken || !userEncoded) {
        setStatus("error");
        setMessage(t("missingParameters"));

        // Rediriger vers login après 3 secondes
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
        return;
      }

      try {
        // Décoder les données utilisateur (non utilisées pour l'instant, mais validées)
        JSON.parse(atob(userEncoded));

        // Stocker les tokens dans les cookies
        Cookies.set("access_token", accessToken, {
          expires: 1 / 24, // 1 heure
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        });

        Cookies.set("refresh_token", refreshToken, {
          expires: 30, // 30 jours
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        });

        setStatus("success");
        setMessage(t("success"));

        // Rediriger vers le dashboard après 1.5 secondes
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } catch {
        setStatus("error");
        setMessage(t("processingFailed"));

        // Rediriger vers login après 3 secondes
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, router, t]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {status === "processing" && t("processing")}
            {status === "success" && t("success")}
            {status === "error" && t("error")}
          </CardTitle>
        </CardHeader>

        <CardContent className="text-center">
          {/* Loading Spinner (processing) */}
          {status === "processing" && (
            <LoadingSpinner className="flex justify-center" />
          )}

          {/* Success Icon */}
          {status === "success" && (
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <SuccessIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          )}

          {/* Error Icon */}
          {status === "error" && (
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <ErrorIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          )}

          {/* Message */}
          {message && (
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              {message}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
