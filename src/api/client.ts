import axios from "axios";

import { useAuthStore } from "@/src/store/authStore";

export const api = axios.create({
  baseURL: "http://172.20.10.5:3000/",
});

api.interceptors.request.use(async (config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
