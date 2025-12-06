import axios from "axios";

// Configuration de l'API avec fallback sur localhost pour le développement
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

if (!process.env.NEXT_PUBLIC_API_URL && typeof window !== "undefined") {
    console.warn("⚠️ API Url not defined in env vars (NEXT_PUBLIC_API_URL), using default:", API_URL);
}

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
    (config) => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
