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

// structura datelor pentru token-ul de autentificare
interface TokenData {
  token: string;
  expiresIn?: number;
}

// structura pentru erorile API
interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

// creăm instanța axios cu configurația implicită
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// interceptor pentru cereri: adaugă token-ul de autentificare la toate cererile
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

// interceptor pentru răspunsuri: gestionează reînnoirea token-ului și logging-ul erorilor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // încearcă reînnoirea token-ului la erorile 401
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log("token-ul a expirat, se încearcă reînnoirea...");

      try {
        // obține refresh token-ul din storage
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          console.error("nu există refresh token disponibil");
          throw new Error("nu există refresh token disponibil");
        }

        // trimite cererea de reînnoire a token-ului
        console.log(
          "se trimite cererea de reînnoire a token-ului către /api/auth/refresh"
        );
        const response = await axios.post(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
          }/api/auth/refresh`,
          { refreshToken },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        // extrage noile token-uri din răspuns
        const { token, refreshToken: newRefreshToken } = response.data;

        if (!token) {
          console.error("nu s-a primit niciun token în răspunsul de reînnoire");
          throw new Error(
            "nu s-a primit niciun token în răspunsul de reînnoire"
          );
        }

        // obține datele utilizatorului curent
        const currentUser = getUserData();

        // creează un obiect LoginResponse cu câmpurile necesare
        const loginResponse: LoginResponse = {
          success: true,
          message: "token reînnoit cu succes",
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

        // salvează noile token-uri
        setAuthData(loginResponse);

        console.log("token reînnoit cu succes");

        // actualizează header-ul de autorizare cu noul token
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${token}`;

        // reia cererea originală cu noul token
        return api(originalRequest);
      } catch (refreshError) {
        console.error("reînnoirea token-ului a eșuat:", refreshError);
        // redirecționează către login dacă reînnoirea eșuează
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    // logging-ul diferitelor tipuri de erori
    if (error.response) {
      const apiError = error.response.data as ApiError;
      console.error(
        `eroare API: ${apiError.message || "eroare necunoscută"} (${
          error.response.status
        })`
      );
    } else if (error.request) {
      console.error("nu s-a primit niciun răspuns:", error.request);
    } else {
      console.error("eroare la configurarea cererii:", error.message);
    }

    return Promise.reject(error);
  }
);

// funcții helper typescript pentru apelurile API
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
