/**
 * AuthContext - Gestion globale de l'authentification
 *
 * Ce Context permet de partager l'état de l'utilisateur dans toute l'application
 * sans avoir à passer les props de composant en composant
 */

"use client";

import * as authApi from "@/lib/api/auth";
import type { LoginData, RegisterData, User } from "@/types/auth";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

/**
 * Type du contexte
 */
interface AuthContextType {
  user: User | null; // Utilisateur connecté (null si déconnecté)
  isLoading: boolean; // Chargement en cours (vérification du token au démarrage)
  isAuthenticated: boolean; // Est-ce que l'utilisateur est connecté ?

  // Fonctions d'authentification
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
}

// Créer le contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provider - Enveloppe toute l'application
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  /**
   * Au chargement de l'app, vérifier si un token existe
   * Si oui, récupérer l'utilisateur connecté
   */
  useEffect(() => {
    const initAuth = async () => {
      const token = Cookies.get("access_token");

      // Si pas de token, on est déconnecté
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // Appeler /auth/me pour récupérer l'utilisateur
        const { user } = await authApi.getCurrentUser();
        setUser(user);
      } catch {
        // Token invalide ou expiré, on le supprime
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Login
   */
  const login = async (data: LoginData) => {
    try {
      const response = await authApi.login(data);

      // Stocker les tokens dans les cookies
      Cookies.set("access_token", response.access_token, {
        expires: 1 / 24, // 1 heure (expires_in = 3600 secondes)
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      // Créer un refresh token (30 jours)
      // Note: Le backend ne retourne pas de refresh token pour login classique actuellement
      // On va le créer côté frontend pour la cohérence
      Cookies.set("refresh_token", response.access_token, {
        expires: 30, // 30 jours
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      // Mettre à jour l'état
      setUser(response.user);

      // Rediriger vers le dashboard
      router.push("/dashboard");
    } catch (error) {
      // Propager l'erreur pour que le composant puisse l'afficher
      const message = error instanceof Error ? error.message : "Login failed";
      throw new Error(message);
    }
  };

  /**
   * Register
   */
  const register = async (data: RegisterData) => {
    try {
      const response = await authApi.register(data);

      // Stocker les tokens
      Cookies.set("access_token", response.access_token, {
        expires: 1 / 24, // 1 heure
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      Cookies.set("refresh_token", response.access_token, {
        expires: 30, // 30 jours
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      // Mettre à jour l'état
      setUser(response.user);

      // Rediriger vers le dashboard
      router.push("/dashboard");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Registration failed";
      throw new Error(message);
    }
  };

  /**
   * Logout
   */
  const logout = async () => {
    try {
      // Appeler l'API pour supprimer le token côté serveur
      await authApi.logout();
    } catch (error) {
      // Même si l'API échoue, on déconnecte côté frontend
      console.error("Logout API call failed:", error);
    } finally {
      // Supprimer les tokens
      Cookies.remove("access_token");
      Cookies.remove("refresh_token");

      // Réinitialiser l'état
      setUser(null);

      // Rediriger vers login
      router.push("/auth/login");
    }
  };

  /**
   * Logout de tous les appareils
   */
  const logoutAll = async () => {
    try {
      await authApi.logoutAll();
    } catch (error) {
      console.error("Logout all API call failed:", error);
    } finally {
      Cookies.remove("access_token");
      Cookies.remove("refresh_token");
      setUser(null);
      router.push("/auth/login");
    }
  };

  // Valeur du contexte
  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user, // true si user existe, false sinon
    login,
    register,
    logout,
    logoutAll,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook pour utiliser le contexte dans les composants
 *
 * Usage: const { user, login, logout } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
