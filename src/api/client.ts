import axios from "axios";

import { useAuthStore } from "@/src/store/authStore";

const url = process.env.EXPO_PUBLIC_BACKENDURL;

export const api = axios.create({
  baseURL: url,
});

api.interceptors.request.use(async (config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
