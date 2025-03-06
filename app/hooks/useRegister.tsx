"use client";
import { useMutation } from "@tanstack/react-query";
import {
  RegisterUserData,
  RegisterResponse,
  registerUser,
} from "../types/register";
import { useRouter } from "next/navigation";
export const useRegister = () => {
  const router = useRouter();
  return useMutation<RegisterResponse, Error, RegisterUserData>({
    mutationFn: (credentials) => registerUser(credentials),
    onSuccess: (data) => {
      console.log(data.user);
      router.push("/login");
    },
  });
};
