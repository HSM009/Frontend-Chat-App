import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

type User = {
  id: string;
  name: string;
  email: string;
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
    await AsyncStorage.setItem("token", token);

    await AsyncStorage.setItem("user", JSON.stringify(user));

    set({
      user,
      token,
    });
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
    const token = await AsyncStorage.getItem("token");

    const user = await AsyncStorage.getItem("user");

    set({
      token,

      user: user ? JSON.parse(user) : null,

      isLoading: false,
    });
  },
}));
