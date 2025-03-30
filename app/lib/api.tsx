import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { getAccessToken, refreshAccessToken } from "./auth-utils";

interface TokenData {
  token: string;
  expiresIn?: number;
}

interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor
api.interceptors.request.use(
  async (config: AxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Add response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const tokenData = await refreshAccessToken();

        // Update the authorization header
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${tokenData.token}`;

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Redirect to login if refresh fails
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (error.response) {
      const apiError = error.response.data as ApiError;
      console.error(
        `API Error: ${apiError.message || "Unknown error"} (${
          error.response.status
        })`
      );
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Request setup error:", error.message);
    }

    return Promise.reject(error);
  }
);

// Add TypeScript support for our API methods
export const apiGet = <T,>(url: string, config?: AxiosRequestConfig) =>
  api.get<T>(url, config).then((res) => res.data);

export const apiPost = <T,>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
) => api.post<T>(url, data, config).then((res) => res.data);

export const apiPut = <T,>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
) => api.put<T>(url, data, config).then((res) => res.data);

export const apiDelete = <T,>(url: string, config?: AxiosRequestConfig) =>
  api.delete<T>(url, config).then((res) => res.data);

// import axios from "axios";
// import { getAccessToken, refreshAccessToken } from "./auth-utils";

// export const api = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
//   withCredentials: true,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// api.interceptors.request.use(
//   async (config) => {
//     const token = getAccessToken();
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       try {
//         const tokenData = await refreshAccessToken();

//         originalRequest.headers.Authorization = `Bearer ${tokenData.token}`;

//         return api(originalRequest);
//       } catch (refreshError) {
//         window.location.href = "/login";
//         return Promise.reject(refreshError);
//       }
//     }

//     return Promise.reject(error);
//   }
// );
