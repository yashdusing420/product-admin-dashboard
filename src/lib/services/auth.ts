import { api } from "@/lib/api";

export interface LoginResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  accessToken?: string;
  token?: string;
}

export async function login(username: string, password: string) {
  const response = await api.post<LoginResponse>("/auth/login", {
    username,
    password,
    expiresInMins: 30
  });
  return response.data;
}