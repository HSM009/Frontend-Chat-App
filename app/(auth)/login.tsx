import {
  View,
  Text,
  Pressable,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import { loginUser } from "@/src/services/authService";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    try {
      setLoading(true);
      const result = await loginUser(phone, password);
      console.info("Signed In");
      console.log(
        "User name: ",
        result.user.name,
        ", User phone: ",
        result.user.phone,
      );

      router.replace("/(tabs)");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-4xl text-center font-bold mb-16 animate-pulse text-yellow-500">
        HSM Chatting App
      </Text>

      <TextInput
        className={`w-80 h-14 border border-gray-300 rounded-2xl px-5 text-gray-800 mb-2 ${
          loading ? "bg-gray-200" : "bg-gray-50"
        }`}
        placeholder="Phone"
        placeholderTextColor="#9CA3AF"
        value={phone}
        onChangeText={setPhone}
        editable={!loading}
      />

      <TextInput
        className={`w-80 h-14 border border-gray-300 rounded-2xl px-5 text-gray-800 mb-2 ${
          loading ? "bg-gray-200" : "bg-gray-50"
        }`}
        placeholder="Password"
        placeholderTextColor="#9CA3AF"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        editable={!loading}
      />

      <Pressable
        disabled={loading}
        className="bg-yellow-500 px-10 py-3 rounded-xl mt-6"
        onPress={handleLogin}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="font-bold text-white">Login</Text>
        )}
      </Pressable>

      <Pressable
        className="mt-6"
        onPress={() => router.push("/(auth)/register")}
      >
        <Text className="text-blue-400">Don't have an account? Register</Text>
      </Pressable>
    </View>
  );
}
