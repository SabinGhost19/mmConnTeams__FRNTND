import { api } from "../lib/api";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
  token: string;
}

export const loginUser = async (
  credentials: LoginCredentials
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>(
    "/api/auth/login",
    credentials
  );
  return response.data;
};
