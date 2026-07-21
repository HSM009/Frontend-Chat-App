import { Redirect } from "expo-router";

import { useAuth } from "@/src/hooks/useAuth";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!token) {
    return <Redirect href="/login" />;
  }

  return children;
}
