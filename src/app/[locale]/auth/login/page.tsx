/**
 * Page Login
 *
 * Formulaire de connexion avec :
 * - Support i18n (traductions)
 * - Support dark mode
 * - Composants d'icônes réutilisables
 * - Email + Password
 * - Boutons OAuth (Google, GitHub)
 * - Lien vers Register
 */

"use client";

import { GitHubIcon, GoogleIcon } from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { redirectToOAuth } from "@/lib/api/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

export default function LoginPage() {
  const t = useTranslations("auth.login");
  const tValidation = useTranslations("auth.validation");
  const { login } = useAuth();
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Schéma de validation Zod avec traductions
   */
  const loginSchema = z.object({
    email: z
      .string()
      .min(1, tValidation("emailRequired"))
      .email(tValidation("emailInvalid")),
    password: z.string().min(1, tValidation("passwordRequired")),
  });

  type LoginFormData = z.infer<typeof loginSchema>;

  /**
   * Configuration du formulaire avec react-hook-form
   */
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  /**
   * Soumission du formulaire
   */
  const onSubmit = async (data: LoginFormData) => {
    setError("");
    setIsLoading(true);

    try {
      await login(data);
      // Redirection automatique vers /dashboard dans le AuthContext
    } catch (err) {
      const message = err instanceof Error ? err.message : t("loginFailed");
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Gestion des boutons OAuth
   */
  const handleOAuthLogin = (provider: "google" | "github") => {
    redirectToOAuth(provider);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {t("title")}
          </CardTitle>
          <CardDescription className="text-center">
            {t("description")}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Affichage des erreurs */}
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-800 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t("emailPlaceholder")}
                {...register("email")}
                disabled={isLoading}
                className="dark:bg-gray-800 dark:border-gray-700"
              />
              {errors.email && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t("passwordPlaceholder")}
                {...register("password")}
                disabled={isLoading}
                className="dark:bg-gray-800 dark:border-gray-700"
              />
              {errors.password && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t("signingIn") : t("signInButton")}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-gray-950 px-2 text-gray-500 dark:text-gray-400">
                {t("orContinueWith")}
              </span>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-3">
            {/* Google Button */}
            <Button
              variant="outline"
              onClick={() => handleOAuthLogin("google")}
              disabled={isLoading}
              className="dark:border-gray-700 dark:hover:bg-gray-800"
            >
              <GoogleIcon className="mr-2 h-4 w-4" />
              Google
            </Button>

            {/* GitHub Button */}
            <Button
              variant="outline"
              onClick={() => handleOAuthLogin("github")}
              disabled={isLoading}
              className="dark:border-gray-700 dark:hover:bg-gray-800"
            >
              <GitHubIcon className="mr-2 h-4 w-4" />
              GitHub
            </Button>
          </div>
        </CardContent>

        <CardFooter>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 w-full">
            {t("noAccount")}{" "}
            <Link
              href="/auth/register"
              className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              {t("signUp")}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
