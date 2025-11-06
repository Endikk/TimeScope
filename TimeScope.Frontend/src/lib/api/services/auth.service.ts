import apiClient from '../client';

// Types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  role: 'Admin' | 'Manager' | 'Employee';
  isActive: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface CurrentUserResponse {
  id: string;
  email: string;
  name: string;
  role: string;
}

// Service d'authentification
export const authApiService = {
  /**
   * Connexion utilisateur
   * @param credentials Email et mot de passe
   * @returns Token JWT, refresh token et informations utilisateur
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  /**
   * Rafraîchir le token JWT
   * @param refreshToken Token de rafraîchissement
   * @returns Nouveau token JWT et refresh token
   */
  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  },

  /**
   * Déconnexion utilisateur
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // On log l'erreur mais on continue la déconnexion côté client
      console.error('Logout API error:', error);
    }
  },

  /**
   * Obtenir l'utilisateur actuellement connecté
   * @returns Informations de l'utilisateur actuel
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

// Helper functions pour le localStorage
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
