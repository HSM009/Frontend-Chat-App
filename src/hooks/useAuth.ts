import { useAuthStore } from "../store/authStore";

export function useAuth() {
  const { user, token, isLoading, login, logout, loadToken } = useAuthStore();

  return {
    user,
    token,
    isLoading,
    isAuthenticated: !!token,
    login,
    logout,
    loadToken,
  };
}
