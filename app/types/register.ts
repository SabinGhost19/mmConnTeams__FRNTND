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

  // admin verification fields
  adminCode?: string;
  adminVerified?: boolean;
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
}

export const registerUser = async (
  credentials: RegisterUserData
): Promise<RegisterResponse> => {
  const formData = new FormData();

  const { profileImage, notificationPreferences, ...userDataFields } =
    credentials;

  const userDataJson = JSON.stringify({
    ...userDataFields,
    notificationPreferences: notificationPreferences
      ? JSON.stringify(notificationPreferences)
      : undefined,
  });

  formData.append(
    "userData",
    new Blob([userDataJson], { type: "application/json" }),
    "userData.json"
  );

  if (profileImage) {
    formData.append("profileImage", profileImage);
  }

  const response = await api.post<RegisterResponse>(
    "/api/auth/register",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};
