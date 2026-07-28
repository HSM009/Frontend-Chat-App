import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

type User = {
  id: string;
  name: string;
  phone: string;
};

type AuthState = {
  user: User | null;

  token: string | null;

  isLoading: boolean;

  login: (user: User, token: string) => Promise<void>;

  logout: () => Promise<void>;

  loadToken: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,

  token: null,

  isLoading: true,

  login: async (user, token) => {
    try {
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));

      set({
        user,
        token,
      });
    } catch (error) {
      console.error("Failed to save auth data:", error);
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem("token");

    await AsyncStorage.removeItem("user");

    set({
      user: null,
      token: null,
    });
  },

  loadToken: async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const user = await AsyncStorage.getItem("user");

      set({
        token,
        user: user ? JSON.parse(user) : null,
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to load auth data:", error);

      set({
        token: null,
        user: null,
        isLoading: false,
      });
    }
  },
}));
