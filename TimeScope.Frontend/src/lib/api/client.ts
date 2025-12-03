import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { env } from '@/lib/config/env';
import { apiLogger } from '@/lib/utils/logger';
import { API_CONFIG, STORAGE_KEYS } from '@/lib/constants';

// Types pour la gestion des erreurs
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
}

// Configuration de l'API
const API_BASE_URL = env.VITE_API_URL;
const API_TIMEOUT = API_CONFIG.TIMEOUT;

// Créer l'instance Axios
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Pas de cookies, utilisation de JWT
});

// Variable pour éviter les rafraîchissements multiples en parallèle
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Intercepteur de requête - Ajout du token JWT et logging
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log de la requête en développement
    apiLogger.request(config.method?.toUpperCase() || 'GET', config.url || '', config.data);

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Intercepteur de réponse - Gestion des erreurs et du rafraîchissement du token
apiClient.interceptors.response.use(
  (response) => {
    // Log de la réponse réussie en développement
    apiLogger.response(
      response.config.method?.toUpperCase() || 'GET',
      response.config.url || '',
      response.status,
      response.data
    );
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Log de l'erreur API
    apiLogger.error(
      originalRequest?.method?.toUpperCase() || 'UNKNOWN',
      originalRequest?.url || '',
      error
    );

    // Si l'erreur n'est pas 401 ou s'il n'y a pas de config, rejet direct
    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(transformError(error));
    }

    // Si l'erreur provient de la connexion, on ne tente pas de refresh
    if (originalRequest.url?.includes('/auth/login')) {
      return Promise.reject(transformError(error));
    }

    // Si l'échec provient d'une tentative de rafraîchissement, déconnexion
    if (originalRequest.url?.includes('/auth/refresh')) {
      handleLogout();
      return Promise.reject(transformError(error));
    }

    // Si une tentative de rafraîchissement a déjà eu lieu, déconnexion
    if (originalRequest._retry) {
      handleLogout();
      return Promise.reject(transformError(error));
    }

    // Si un rafraîchissement est déjà en cours, mise en file d'attente
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      isRefreshing = false;
      handleLogout();
      return Promise.reject(transformError(error));
    }

    try {
      // Tentative de rafraîchissement du token
      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refreshToken: refreshToken,
      });

      const { token: newToken, refreshToken: newRefreshToken } = response.data;

      // Mise à jour des tokens
      localStorage.setItem('token', newToken);
      localStorage.setItem('refreshToken', newRefreshToken);

      // Mise à jour du header de la requête originale
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
      }

      processQueue(null, newToken);
      isRefreshing = false;

      // Nouvelle tentative de la requête originale
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError as Error, null);
      isRefreshing = false;
      handleLogout();
      return Promise.reject(transformError(error));
    }
  }
);

// Déconnexion de l'utilisateur
const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');

  // Redirection vers la page de connexion
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

// Transformation des erreurs Axios en format standard
const transformError = (error: AxiosError): ApiError => {
  if (error.response) {
    // Le serveur a répondu avec un code d'erreur
    const responseData = error.response.data as { message?: string; code?: string } | undefined;
    return {
      message: responseData?.message || error.message,
      status: error.response.status,
      code: responseData?.code,
      details: error.response.data,
    };
  } else if (error.request) {
    // La requête a été envoyée mais aucune réponse n'a été reçue
    return {
      message: 'Impossible de contacter le serveur. Vérifiez votre connexion internet.',
      code: 'NETWORK_ERROR',
    };
  } else {
    // Erreur lors de la configuration de la requête
    return {
      message: error.message || 'Une erreur inattendue est survenue',
      code: 'UNKNOWN_ERROR',
    };
  }
};

export default apiClient;
