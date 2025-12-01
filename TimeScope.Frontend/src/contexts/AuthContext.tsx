import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  authApiService,
  tokenStorage,
  User,
  LoginCredentials,
} from '@/lib/api/services/auth.service';
import { ApiError } from '@/lib/api/client';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  hasRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté au chargement
    const initAuth = async () => {
      try {
        const storedUser = tokenStorage.getUser();
        const token = tokenStorage.getToken();

        if (storedUser && token) {
          // Vérifier que le token est encore valide
          const isValid = await authApiService.validateToken();

          if (isValid) {
            setUser(storedUser);
          } else {
            // Token invalide, nettoyer
            tokenStorage.clear();
          }
        }
      } catch (err) {
        console.error('Erreur d\'initialisation de l\'authentification :', err);
        tokenStorage.clear();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authApiService.login(credentials);

      // Sauvegarder les tokens et les infos utilisateur
      tokenStorage.save(response.token, response.refreshToken, response.user);

      setUser(response.user);
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.message || 'Échec de la connexion. Vérifiez vos identifiants.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authApiService.logout();
    } catch (err) {
      console.error('Erreur lors de la déconnexion :', err);
    } finally {
      // Nettoyer l'état local même en cas d'erreur
      tokenStorage.clear();
      setUser(null);
      setError(null);
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const hasRole = (roles: string[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        logout,
        clearError,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};
