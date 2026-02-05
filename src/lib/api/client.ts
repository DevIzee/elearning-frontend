/**
 * API Client - Configuration Axios
 *
 * Ce fichier configure axios pour communiquer avec l'API Laravel
 * - Ajoute automatiquement le token dans les headers
 * - Gère le refresh token automatique
 * - Gère les erreurs globalement
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

// Créer une instance axios configurée
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // http://localhost:8000/api
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false, // On utilise pas les cookies Laravel (on utilise Bearer token)
});

/**
 * Intercepteur REQUEST
 *
 * Ajoute automatiquement le token dans les headers avant chaque requête
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Récupérer le token depuis les cookies
    const token = Cookies.get("access_token");

    // Si un token existe, l'ajouter dans le header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * Intercepteur RESPONSE
 *
 * Gère les erreurs globalement :
 * - 401 Unauthorized : Token expiré → tente de refresh
 * - Autres erreurs : retourne l'erreur formatée
 */
apiClient.interceptors.response.use(
  // Succès : retourne la réponse telle quelle
  (response) => response,

  // Erreur : gère selon le code HTTP
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Si erreur 401 (Unauthorized) et qu'on n'a pas encore retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Récupérer le refresh token
        const refreshToken = Cookies.get("refresh_token");

        if (!refreshToken) {
          // Pas de refresh token → rediriger vers login
          throw new Error("No refresh token available");
        }

        // Appeler l'endpoint refresh
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          },
        );

        // Sauvegarder le nouveau access token
        Cookies.set("access_token", data.access_token, {
          expires: 1 / 24, // 1 heure
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        });

        // Retry la requête originale avec le nouveau token
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh a échoué → déconnecter l'utilisateur
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");

        // Rediriger vers login (on verra ça dans le AuthContext)
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }

        return Promise.reject(refreshError);
      }
    }

    // Autres erreurs : retourner telles quelles
    return Promise.reject(error);
  },
);

export default apiClient;
