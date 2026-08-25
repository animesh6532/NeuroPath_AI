import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
  withCredentials: false,
});

// Request Interceptor: Automatically inject JWT authorization token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Auto-refresh token if 401 occurs
API.interceptors.response.use(
  (response) => {
    // Unwrap { success, data, message } envelope if it exists
    if (
      response.data &&
      typeof response.data === "object" &&
      typeof response.data.success !== "undefined"
    ) {
      return {
        ...response,
        data: response.data.data ?? null,
        originalData: response.data,
        success: response.data.success,
        message: response.data.message,
      };
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh") &&
      !originalRequest.url.includes("/auth/login")
    ) {
      originalRequest._retry = true;
      try {
        const currentToken = localStorage.getItem("token");
        if (currentToken) {
          // Attempt token refresh via backend refresh endpoint
          const res = await axios.post(
            `${API.defaults.baseURL}/auth/refresh`,
            {},
            {
              headers: {
                Authorization: `Bearer ${currentToken}`
              }
            }
          );
          if (res.status === 200 && res.data?.access_token) {
            const newToken = res.data.access_token;
            localStorage.setItem("token", newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return API(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error("Token refresh failed. Redirecting to login.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default API;
