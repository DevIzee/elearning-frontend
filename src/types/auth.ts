/**
 * Types pour l'authentification
 *
 * Ces types correspondent aux données retournées par l'API Laravel
 */

// Utilisateur (correspond à UserResource Laravel)
export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url: string;
  is_active: boolean;
  bio: string | null;
  roles: string[]; // ['student'] ou ['instructor'] ou ['admin']
  permissions: string[]; // Liste des permissions Spatie
  courses_count?: number; // Pour les instructeurs
  enrollments_count: number;
  certificates_count: number;
  email_verified_at: string | null;
  created_at: string;
}

// Réponse de l'API après login/register
export interface AuthResponse {
  message: string;
  user: User;
  access_token: string;
  token_type: string; // "Bearer"
  expires_in: number; // Secondes (3600 = 1h)
}

// Réponse de l'API pour refresh token
export interface RefreshTokenResponse {
  message: string;
  access_token: string;
  token_type: string;
  expires_in: number;
}

// Réponse de l'API /auth/me
export interface MeResponse {
  user: User;
}

// Données pour register
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role?: "student" | "instructor";
}

// Données pour login
export interface LoginData {
  email: string;
  password: string;
}

// Erreur API
export interface ApiError {
  message: string;
  error?: string;
  errors?: Record<string, string[]>; // Erreurs de validation Laravel
}
