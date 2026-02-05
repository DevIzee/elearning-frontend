/**
 * Auth Service
 *
 * Contient toutes les fonctions pour appeler les endpoints d'authentification
 * - Register
 * - Login
 * - Logout
 * - Get current user
 * - Refresh token
 */

import type {
  AuthResponse,
  LoginData,
  MeResponse,
  RefreshTokenResponse,
  RegisterData,
} from "@/types/auth";
import apiClient from "./client";

/**
 * Inscription d'un nouvel utilisateur
 *
 * Endpoint: POST /api/auth/register
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>("/auth/register", data);
  return response.data;
};

/**
 * Connexion utilisateur
 *
 * Endpoint: POST /api/auth/login
 */
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>("/auth/login", data);
  return response.data;
};

/**
 * Déconnexion (supprime le token actuel)
 *
 * Endpoint: POST /api/auth/logout
 */
export const logout = async (): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>("/auth/logout");
  return response.data;
};

/**
 * Récupérer l'utilisateur connecté
 *
 * Endpoint: GET /api/auth/me
 */
export const getCurrentUser = async (): Promise<MeResponse> => {
  const response = await apiClient.get<MeResponse>("/auth/me");
  return response.data;
};

/**
 * Refresh access token
 *
 * Endpoint: POST /api/auth/refresh
 *
 * Note: Cette fonction est déjà appelée automatiquement par l'interceptor axios
 * Mais on l'expose au cas où on veuille l'appeler manuellement
 */
export const refreshToken = async (): Promise<RefreshTokenResponse> => {
  const response = await apiClient.post<RefreshTokenResponse>("/auth/refresh");
  return response.data;
};

/**
 * Déconnexion de tous les appareils
 *
 * Endpoint: POST /api/auth/logout-all
 */
export const logoutAll = async (): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>(
    "/auth/logout-all",
  );
  return response.data;
};

/**
 * Redirection OAuth (Google ou GitHub)
 *
 * Cette fonction ne fait pas d'appel API, elle redirige directement
 * vers l'endpoint Laravel qui redirige vers le provider OAuth
 */
export const redirectToOAuth = (provider: "google" | "github") => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  window.location.href = `${apiUrl}/auth/${provider}`;
};
