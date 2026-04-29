import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

// --- Request Interceptor: attach JWT + log every outgoing request ---
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(`📡 [API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
});

// --- Response Interceptor: log responses and handle 401 globally ---
api.interceptors.response.use(
  (response) => {
    console.log(
      `✅ [API] ${response.config.method?.toUpperCase()} ${response.config.url} → ${response.status}`
    );
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    const message = error.response?.data?.message || error.message;

    console.error(`❌ [API] ${error.config?.method?.toUpperCase()} ${url} → ${status} | ${message}`);

    // Handle 401 globally — redirect to login
    if (status === 401) {
      console.warn("[API] 401 Unauthorized — clearing session and redirecting to /login");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;

