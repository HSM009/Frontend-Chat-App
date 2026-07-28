import { api } from "./client";

export interface LoginPayload {
  phone: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    name: string;
    phone: string;
  };
  accessToken: string;
}

export async function loginRequest(data: LoginPayload) {
  const response = await api.post<LoginResponse>("/auth/login", data);
  return response.data;
}

export interface RegisterPayload {
  name: string;
  phone: string;
  password: string;
}

export async function registerRequest(data: RegisterPayload) {
  const response = await api.post("/auth/register", data);
  return response.data;
}
