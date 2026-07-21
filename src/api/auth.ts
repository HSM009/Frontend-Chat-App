import { api } from "./client";

export interface LoginPayload {
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

export async function loginRequest(data: LoginPayload) {
  const response = await api.post<LoginResponse>("/auth/login", data);

  return response.data;
}
