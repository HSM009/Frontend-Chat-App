import axios from "axios";
import { useAuthStore } from "@/src/store/authStore";

const primaryURL = process.env.EXPO_PUBLIC_BACKENDURL;
const backupURL = process.env.EXPO_PUBLIC_BACKENDURL2;

let activeURL = primaryURL;

console.info("🌐 Primary Backend:", primaryURL);
console.info("🌐 Backup Backend:", backupURL);
console.info("🌐 Active URL:", activeURL);

export const api = axios.create({
  baseURL: activeURL,
  timeout: 5000,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  config.baseURL = activeURL;

  console.info(
    "➡️ Request:",
    config.method?.toUpperCase(),
    `${activeURL}${config.url}`,
  );

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    console.info(
      "✅ Connected:",
      activeURL,
      response.status,
      response.config.url,
    );

    return response;
  },

  async (error) => {
    const originalRequest = error.config;

    console.info("❌ Failed:", activeURL, error.message);

    if (
      !originalRequest._retry &&
      (!error.response || error.code === "ECONNABORTED")
    ) {
      originalRequest._retry = true;

      activeURL = activeURL === primaryURL ? backupURL : primaryURL;

      console.info("🔄 Switching backend to:", activeURL);

      originalRequest.baseURL = activeURL;

      return api(originalRequest);
    }

    return Promise.reject(error);
  },
);
