import { View, Text, Button } from "react-native";

import { useAuth } from "@/src/hooks/useAuth";

export default function Profile() {
  const { user, logout } = useAuth();

  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-xl">Hello {user?.name}</Text>

      <Button title="Logout" onPress={logout} />
    </View>
  );
}
