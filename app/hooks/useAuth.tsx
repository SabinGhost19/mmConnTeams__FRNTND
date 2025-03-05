"use client";
import { useMutation } from "@tanstack/react-query";
import { loginUser, LoginCredentials, LoginResponse } from "../types/login";
import { useRouter } from "next/navigation";

export const useLogin = () => {
  const router = useRouter();
  return useMutation<LoginResponse, Error, LoginCredentials>({
    mutationFn: (credentials) => loginUser(credentials),
    onSuccess: (data) => {
      //stocare token in local storage or put it in a cookie
      //+
      //redirectare
      console.log(data.user);
      router.push("/home");
    },
  });
};
