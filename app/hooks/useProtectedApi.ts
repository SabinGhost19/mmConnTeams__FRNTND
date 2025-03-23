// src/hooks/useProtectedApi.ts
"use client";

import { useAuth } from "../contexts/auth-context";
import { api } from "../lib/api";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function useProtectedApi() {
  const { logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchData = async <T>(
    endpoint: string,
    options?: any
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<T>(endpoint, options);
      return response.data;
    } catch (err: any) {
      if (err.message === "Failed to refresh token") {
        logout();
        router.push("/login");
      }

      setError(err.message || "An error occurred");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const postData = async <T>(
    endpoint: string,
    data: any,
    options?: any
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<T>(endpoint, data, options);
      return response.data;
    } catch (err: any) {
      if (err.message === "Failed to refresh token") {
        logout();
        router.push("/login");
      }

      setError(err.message || "An error occurred");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchData,
    postData,
    isLoading,
    error,
  };
}

function async<T>(endpoint: any, string: any, arg2: any) {
  throw new Error("Function not implemented.");
}
