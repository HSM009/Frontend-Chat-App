import { View, Text, Pressable } from "react-native";
import { useAuth } from "@/src/hooks/useAuth";
import { router } from "expo-router";

export default function SettingsScreen() {
  const { logout } = useAuth();

  async function handleLogout() {
    try {
      await logout();
      router.replace("/(auth)/login");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-3xl font-bold mb-10">Settings</Text>

      <Pressable
        onPress={handleLogout}
        className="bg-red-500 px-8 py-4 rounded-xl"
      >
        <Text className="text-white font-bold">Logout</Text>
      </Pressable>
    </View>
  );
}
