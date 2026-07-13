import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const api = axios.create({ baseURL });

// Adjuntar token JWT en cada request si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("alpha_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Si la API responde 401, limpiar sesión
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("alpha_token");
      localStorage.removeItem("alpha_user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);
