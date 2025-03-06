import { ROLE } from "./models_types/roles";
import { User } from "./models_types/userType";
import { api } from "../lib/api";
export interface RegisterUserData extends Omit<User, "role"> {
  role: ROLE;

  confirmPassword: string;

  institution: string;
  studyLevel?: string;
  specialization?: string;
  year?: number;
  group?: string;

  bio?: string;
  profileImage?: File;
  phoneNumber?: string;

  notificationPreferences?: {
    email: boolean;
    push: boolean;
    desktop: boolean;
  };

  termsAccepted: boolean;
  privacyPolicyAccepted: boolean;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: ROLE;
  };
  token?: string;
}

export const registerUser = async (
  credentials: RegisterUserData
): Promise<RegisterResponse> => {
  const formData = new FormData();

  Object.entries(credentials).forEach(([key, value]) => {
    if (key === "profileImage" && value) {
      formData.append(key, value);
    } else if (key === "notificationPreferences") {
      formData.append(key, JSON.stringify(value));
    } else if (value !== undefined) {
      formData.append(key, String(value));
    }
  });
  const response = await api.post<RegisterResponse>("/register", formData);

  return response.data;
};
