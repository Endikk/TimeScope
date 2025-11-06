// DEPRECATED: Ce fichier est conservé pour compatibilité
// Utilisez plutôt @/lib/api/services/auth.service

import {
  authApiService,
  tokenStorage,
  User,
  LoginCredentials,
  LoginResponse,
} from '@/lib/api/services/auth.service';

// Ré-exporter les types pour compatibilité
export type { User, LoginCredentials, LoginResponse };

// Wrapper pour compatibilité avec l'ancien code
export const authService = {
  login: authApiService.login.bind(authApiService),
  logout: authApiService.logout.bind(authApiService),
  refreshToken: authApiService.refreshToken.bind(authApiService),
  getCurrentUser: authApiService.getCurrentUser.bind(authApiService),
  isAuthenticated: tokenStorage.isAuthenticated.bind(tokenStorage),
  getToken: tokenStorage.getToken.bind(tokenStorage),
  getStoredUser: tokenStorage.getUser.bind(tokenStorage),
};
