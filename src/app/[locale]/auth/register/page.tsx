/**
 * Page Register
 *
 * Formulaire d'inscription avec :
 * - Support i18n (traductions)
 * - Support dark mode
 * - Name, Email, Password, Confirm Password
 * - Choix du rôle (Student/Instructor)
 * - Boutons OAuth (Google, GitHub)
 * - Lien vers Login
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/contexts/AuthContext";
import { redirectToOAuth } from "@/lib/api/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

export default function RegisterPage() {
  const t = useTranslations("auth.register");
  const tValidation = useTranslations("auth.validation");
  const { register: registerUser } = useAuth();
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Schéma de validation Zod avec traductions
   */
  const registerSchema = z
    .object({
      name: z
        .string()
        .min(1, tValidation("nameRequired"))
        .min(2, tValidation("nameMin")),
      email: z
        .string()
        .min(1, tValidation("emailRequired"))
        .email(tValidation("emailInvalid")),
      password: z
        .string()
        .min(1, tValidation("passwordRequired"))
        .min(8, tValidation("passwordMin")),
      password_confirmation: z.string().min(1, tValidation("passwordRequired")),
      role: z.enum(["student", "instructor"]),
    })
    .refine((data) => data.password === data.password_confirmation, {
      message: tValidation("passwordMismatch"),
      path: ["password_confirmation"],
    });

  type RegisterFormData = z.infer<typeof registerSchema>;

  /**
   * Configuration du formulaire avec react-hook-form
   */
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "student",
    },
  });

  const selectedRole = watch("role");

  /**
   * Soumission du formulaire
   */
  const onSubmit = async (data: RegisterFormData) => {
    setError("");
    setIsLoading(true);

    try {
      await registerUser(data);
      // Redirection automatique vers /dashboard dans le AuthContext
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("registrationFailed");
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Gestion des boutons OAuth
   */
  const handleOAuthRegister = (provider: "google" | "github") => {
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
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">{t("name")}</Label>
              <Input
                id="name"
                type="text"
                placeholder={t("namePlaceholder")}
                {...register("name")}
                disabled={isLoading}
                className="dark:bg-gray-800 dark:border-gray-700"
              />
              {errors.name && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.name.message}
                </p>
              )}
            </div>

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

            {/* Password Confirmation */}
            <div className="space-y-2">
              <Label htmlFor="password_confirmation">
                {t("passwordConfirm")}
              </Label>
              <Input
                id="password_confirmation"
                type="password"
                placeholder={t("passwordConfirmPlaceholder")}
                {...register("password_confirmation")}
                disabled={isLoading}
                className="dark:bg-gray-800 dark:border-gray-700"
              />
              {errors.password_confirmation && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.password_confirmation.message}
                </p>
              )}
            </div>

            {/* Role Selection */}
            <div className="space-y-3">
              <Label>{t("role")}</Label>
              <RadioGroup
                value={selectedRole}
                onValueChange={(value: "student" | "instructor") => {
                  setValue("role", value, { shouldValidate: true });
                }}
                className="grid grid-cols-2 gap-3"
              >
                {/* Student Option */}
                <div>
                  <RadioGroupItem
                    value="student"
                    id="student"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="student"
                    className={`flex items-center justify-center rounded-md border-2 bg-white dark:bg-gray-800 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-all ${
                      selectedRole === "student"
                        ? "border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <span className="text-sm font-medium">
                      {t("roleStudent")}
                    </span>
                  </Label>
                </div>

                {/* Instructor Option */}
                <div>
                  <RadioGroupItem
                    value="instructor"
                    id="instructor"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="instructor"
                    className={`flex items-center justify-center rounded-md border-2 bg-white dark:bg-gray-800 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-all ${
                      selectedRole === "instructor"
                        ? "border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <span className="text-sm font-medium">
                      {t("roleInstructor")}
                    </span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t("signingUp") : t("signUpButton")}
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
              onClick={() => handleOAuthRegister("google")}
              disabled={isLoading}
              className="dark:border-gray-700 dark:hover:bg-gray-800"
            >
              <GoogleIcon className="mr-2 h-4 w-4" />
              Google
            </Button>

            {/* GitHub Button */}
            <Button
              variant="outline"
              onClick={() => handleOAuthRegister("github")}
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
            {t("haveAccount")}{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              {t("signIn")}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
