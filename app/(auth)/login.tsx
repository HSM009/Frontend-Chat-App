import { View, Text, Pressable, TextInput } from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import { loginUser } from "@/src/services/authService";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  async function handleLogin() {
    const result = await loginUser(email, password);

    console.log(result);

    router.replace("/(tabs)");
  }
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-4xl text-center font-bold mb-16 animate-pulse text-yellow-500">
        HSM Chatting App
      </Text>

      <TextInput
        className="w-80 h-14 border border-gray-300 rounded-2xl px-5 text-gray-800 bg-gray-50 mb-4"
        placeholder="Email"
        placeholderTextColor="#9CA3AF"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        className="w-80 h-14 border border-gray-300 rounded-2xl px-5 text-gray-800 bg-gray-50 mb-2"
        placeholder="Password"
        placeholderTextColor="#9CA3AF"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Login Button */}

      <Pressable
        className="bg-yellow-500 px-10 py-3 rounded-xl mt-6"
        onPress={handleLogin}
      >
        <Text className="font-bold">Login</Text>
      </Pressable>
      {/* Register Button */}

      <Pressable
        className="mt-6"
        onPress={() => router.push("/(auth)/register")}
      >
        <Text className="text-blue-400">Don't have an account? Register</Text>
      </Pressable>
    </View>
  );
}
