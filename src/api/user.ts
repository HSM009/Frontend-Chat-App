import { api } from "./client";

export interface User {
  id: string;
  name: string;
  phone: string;
  isOnline: boolean;
}

export async function getUsers() {
  const response = await api.get<User[]>("/users");

  return response.data;
}
