/**
 * Service d'authentification
 * Gère l'authentification des utilisateurs, la gestion des tokens et les sessions
 *
 * @module services/auth
 */

import apiClient from '../client';

/**
 * Entité utilisateur représentant un utilisateur authentifié
 */
import { User } from '@/types/user';

/**
 * Entité utilisateur représentant un utilisateur authentifié
 */
// Re-export User for backward compatibility if needed, or just use the imported one
export type { User };

/**
 * Identifiants requis pour l'authentification
 */
export interface LoginCredentials {
  /** Adresse email de l'utilisateur */
  email: string;
  /** Mot de passe de l'utilisateur */
  password: string;
}

/**
 * Réponse retournée après une connexion réussie
 */
export interface LoginResponse {
  /** Token d'accès JWT pour l'authentification API */
  token: string;
  /** Token de rafraîchissement pour obtenir de nouveaux tokens d'accès */
  refreshToken: string;
  /** Informations de l'utilisateur authentifié */
  user: User;
}

/**
 * Requête pour le rafraîchissement du token
 */
export interface RefreshTokenRequest {
  /** Token de rafraîchissement actuel */
  refreshToken: string;
}

/**
 * Informations de l'utilisateur courant
 */
export interface CurrentUserResponse {
  /** ID de l'utilisateur */
  id: string;
  /** Email de l'utilisateur */
  email: string;
  /** Nom complet de l'utilisateur */
  name: string;
  /** Rôle de l'utilisateur */
  role: string;
}

/**
 * Service API d'authentification
 * Fournit des méthodes pour l'authentification et la gestion de session
 */
export const authApiService = {
  /**
   * Authentifie un utilisateur avec email et mot de passe
   *
   * @param credentials - Identifiants de connexion (email et mot de passe)
   * @returns Promesse résolue avec la réponse de connexion (tokens et infos utilisateur)
   * @throws {ApiError} En cas d'échec d'authentification ou d'identifiants invalides
   *
   * @example
   * ```typescript
   * const response = await authApiService.login({
   *   email: 'user@example.com',
   *   password: 'password123'
   * });
   * console.log(response.token); // JWT access token
   * ```
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  /**
   * Rafraîchit un token d'accès JWT expiré via un token de rafraîchissement
   *
   * @param refreshToken - Token de rafraîchissement valide
   * @returns Promesse résolue avec les nouveaux tokens et infos utilisateur
   * @throws {ApiError} Si le token de rafraîchissement est invalide ou expiré
   *
   * @example
   * ```typescript
   * const response = await authApiService.refreshToken('refresh-token-here');
   * localStorage.setItem('token', response.token);
   * ```
   */
  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  },

  /**
   * Déconnecte l'utilisateur courant et invalide la session
   * Poursuit la déconnexion côté client même si l'appel API échoue
   *
   * @returns Promesse résolue une fois la déconnexion terminée
   *
   * @example
   * ```typescript
   * await authApiService.logout();
   * localStorage.clear();
   * navigate('/login');
   * ```
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Log de l'erreur mais poursuite de la déconnexion côté client
      console.error('Erreur API lors de la déconnexion :', error);
    }
  },

  /**
   * Récupère les informations de l'utilisateur actuellement authentifié
   *
   * @returns Promesse résolue avec les détails de l'utilisateur
   * @throws {ApiError} Si l'utilisateur n'est pas authentifié ou le token invalide
   *
   * @example
   * ```typescript
   * const user = await authApiService.getCurrentUser();
   * console.log(user.email); // user@example.com
   * ```
   */
  async getCurrentUser(): Promise<CurrentUserResponse> {
    const response = await apiClient.get<CurrentUserResponse>('/auth/me');
    return response.data;
  },

  /**
   * Vérifier si un token est valide
   * @returns true si le token est valide
   */
  async validateToken(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch {
      return false;
    }
  },
};

// Fonctions utilitaires pour le localStorage
export const tokenStorage = {
  /**
   * Sauvegarder les tokens et l'utilisateur
   */
  save(token: string, refreshToken: string, user: User): void {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
  },

  /**
   * Récupérer le token JWT
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  },

  /**
   * Récupérer le refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  },

  /**
   * Récupérer l'utilisateur stocké
   */
  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  /**
   * Vérifier si l'utilisateur est connecté
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  /**
   * Supprimer tous les tokens et données utilisateur
   */
  clear(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
};
