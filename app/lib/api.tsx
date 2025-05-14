import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import {
  getAccessToken,
  getRefreshToken,
  refreshAccessToken,
  setAuthData,
  getUserData,
} from "./auth-utils";
import { LoginResponse } from "../types/login";

// auth token data structure
interface TokenData {
  token: string;
  expiresIn?: number;
}

// api error structure
interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

// create axios instance with default config
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// request interceptor: add auth token to all requests
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// response interceptor: handle token refresh and error logging
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // try to refresh token on 401 errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          throw new Error("no refresh token available");
        }

        const response = await axios.post(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
          }/api/auth/refresh`,
          { refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );

        const { token, refreshToken: newRefreshToken } = response.data;

        if (!token) {
          throw new Error("no token received in refresh response");
        }

        const currentUser = getUserData();
        const loginResponse: LoginResponse = {
          success: true,
          message: "token refreshed successfully",
          user: currentUser || {
            id: "",
            email: "",
            firstName: "",
            lastName: "",
            roles: [],
          },
          token,
          refreshToken: newRefreshToken || refreshToken,
        };

        setAuthData(loginResponse);

        // update auth header with new token
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${token}`;

        // retry original request with new token
        return api(originalRequest);
      } catch (refreshError) {
        // redirect to login if refresh fails
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    // minimal error logging
    if (error.response) {
      console.error(
        `api error: ${error.response.status} - ${
          error.response.data?.message || "unknown error"
        }`
      );
    } else if (error.request) {
      console.error("no response received", error.request);
    } else {
      console.error("request setup error:", error.message);
    }

    return Promise.reject(error);
  }
);

// typescript helper functions for api calls
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

// chat api functions
export const getPrivateChats = () => apiGet("/api/private-chats");
export const getPrivateChat = (chatId: string) =>
  apiGet(`/api/private-chats/${chatId}`);
export const createPrivateChat = (data: { targetUserId: string }) =>
  apiPost("/api/private-chats", data);
export const getPrivateChatMessages = (chatId: string) =>
  apiGet(`/api/private-chats/${chatId}/messages`);
export const sendPrivateMessage = (
  chatId: string,
  data: { content: string; attachments?: any[] }
) => apiPost(`/api/private-chats/${chatId}/messages`, data);
