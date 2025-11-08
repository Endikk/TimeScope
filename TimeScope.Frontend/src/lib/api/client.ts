import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { env } from '@/lib/config/env';
import { apiLogger } from '@/lib/utils/logger';
import { API_CONFIG, STORAGE_KEYS } from '@/lib/constants';

// Types pour la gestion des erreurs
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
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
  withCredentials: false, // Pas besoin de cookies, on utilise JWT
});

// Variable pour éviter les rafraîchissements multiples en parallèle
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
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

// Intercepteur de requête - Ajouter le token JWT et logger
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    apiLogger.request(config.method?.toUpperCase() || 'GET', config.url || '', config.data);

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Intercepteur de réponse - Gérer les erreurs et le refresh token
apiClient.interceptors.response.use(
  (response) => {
    // Log successful response in development
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

    // Log API error
    apiLogger.error(
      originalRequest?.method?.toUpperCase() || 'UNKNOWN',
      originalRequest?.url || '',
      error
    );

    // Si l'erreur n'est pas 401 ou pas de config, rejeter directement
    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(transformError(error));
    }

    // Si c'est une tentative de refresh qui échoue, déconnecter
    if (originalRequest.url?.includes('/auth/refresh')) {
      handleLogout();
      return Promise.reject(transformError(error));
    }

    // Si déjà tenté de rafraîchir, déconnecter
    if (originalRequest._retry) {
      handleLogout();
      return Promise.reject(transformError(error));
    }

    // Si un refresh est déjà en cours, mettre en queue
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
      // Tenter de rafraîchir le token
      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refreshToken: refreshToken,
      });

      const { token: newToken, refreshToken: newRefreshToken } = response.data;

      // Mettre à jour les tokens
      localStorage.setItem('token', newToken);
      localStorage.setItem('refreshToken', newRefreshToken);

      // Mettre à jour le header de la requête originale
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
      }

      processQueue(null, newToken);
      isRefreshing = false;

      // Réessayer la requête originale
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError as Error, null);
      isRefreshing = false;
      handleLogout();
      return Promise.reject(transformError(error));
    }
  }
);

// Fonction pour déconnecter l'utilisateur
const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');

  // Rediriger vers la page de login
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

// Transformer les erreurs Axios en format standard
const transformError = (error: AxiosError): ApiError => {
  if (error.response) {
    // Le serveur a répondu avec un code d'erreur
    return {
      message: (error.response.data as any)?.message || error.message,
      status: error.response.status,
      code: (error.response.data as any)?.code,
      details: error.response.data,
    };
  } else if (error.request) {
    // La requête a été faite mais pas de réponse
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
