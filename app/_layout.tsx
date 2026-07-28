import "../global.css";

import AuthProvider from "@/src/providers/authProvider";

import { Stack } from "expo-router";
import { useAuth } from "@/src/hooks/useAuth";

import { View, Text } from "react-native";
import QueryProvider from "@/src/providers/queryProvider";

function Navigation() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {token ? <Stack.Screen name="(tabs)" /> : <Stack.Screen name="(auth)" />}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryProvider>
      <AuthProvider>
        <Navigation />
      </AuthProvider>
    </QueryProvider>
  );
}
