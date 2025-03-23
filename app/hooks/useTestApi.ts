import { useMutation } from "@tanstack/react-query";
import { api } from "../lib/api";

interface TestApiData {
  someData: string;
}
export const useTestApi = () => {
  return useMutation<any, Error, TestApiData>({
    mutationFn: async (data: TestApiData) => {
      const response = await api.get("/api/auth/test");
      return response.data;
    },
  });
};
