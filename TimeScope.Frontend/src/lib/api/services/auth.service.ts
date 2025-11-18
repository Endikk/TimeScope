/**
 * Authentication Service
 * Handles user authentication, token management, and session operations
 *
 * @module services/auth
 */

import apiClient from '../client';

/**
 * User entity representing an authenticated user
 */
/**
 * User entity - Matches backend UserDto
 * Note: This should match TimeScope.Core.Interfaces.IAuthService.UserDto
 */
export interface User {
  /** Unique user identifier (Guid from backend, serialized as string) */
  id: string;
  /** User's first name */
  firstName: string;
  /** User's last name */
  lastName: string;
  /** User's email address */
  email: string;
  /** Optional avatar URL */
  avatar?: string;
  /** User's role in the system - matches backend UserRole enum */
  role: 'Admin' | 'Manager' | 'Employee';
  /** Whether the user account is active */
  isActive: boolean;
  /** Professional Information */
  phoneNumber?: string;
  jobTitle?: string;
  department?: string;
  hireDate?: string;
}

/**
 * Login credentials required for authentication
 */
export interface LoginCredentials {
  /** User's email address */
  email: string;
  /** User's password */
  password: string;
}

/**
 * Response returned after successful login
 */
export interface LoginResponse {
  /** JWT access token for API authentication */
  token: string;
  /** Refresh token for obtaining new access tokens */
  refreshToken: string;
  /** Authenticated user information */
  user: User;
}

/**
 * Request payload for token refresh
 */
export interface RefreshTokenRequest {
  /** Current refresh token */
  refreshToken: string;
}

/**
 * Current user information response
 */
export interface CurrentUserResponse {
  /** User ID */
  id: string;
  /** User email */
  email: string;
  /** User full name */
  name: string;
  /** User role */
  role: string;
}

/**
 * Authentication API Service
 * Provides methods for user authentication and session management
 */
export const authApiService = {
  /**
   * Authenticates a user with email and password
   *
   * @param credentials - User login credentials (email and password)
   * @returns Promise resolving to login response with tokens and user info
   * @throws {ApiError} When authentication fails or credentials are invalid
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
   * Refreshes an expired JWT access token using a refresh token
   *
   * @param refreshToken - Current valid refresh token
   * @returns Promise resolving to new tokens and user info
   * @throws {ApiError} When refresh token is invalid or expired
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
   * Logs out the current user and invalidates the session
   * Continues client-side logout even if API call fails
   *
   * @returns Promise that resolves when logout is complete
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
      // Log error but continue with client-side logout
      console.error('Logout API error:', error);
    }
  },

  /**
   * Retrieves the currently authenticated user's information
   *
   * @returns Promise resolving to current user details
   * @throws {ApiError} When user is not authenticated or token is invalid
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
