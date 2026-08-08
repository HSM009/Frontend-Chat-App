import { View, Text, Pressable, TextInput } from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import { registerUser } from "@/src/services/registerService";
import { ActivityIndicator } from "react-native";

export default function Register() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    try {
      setLoading(true);
      const result = await registerUser(name, phone, password);
      router.replace("/(auth)/login");
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
        placeholder="Name"
        value={name}
        onChangeText={setName}
        editable={!loading}
      />

      <TextInput
        className={`w-80 h-14 border border-gray-300 rounded-2xl px-5 text-gray-800 mb-2 ${
          loading ? "bg-gray-200" : "bg-gray-50"
        }`}
        placeholder="Phone Number"
        value={phone}
        onChangeText={setPhone}
        editable={!loading}
      />
      <TextInput
        className={`w-80 h-14 border border-gray-300 rounded-2xl px-5 text-gray-800 mb-2 ${
          loading ? "bg-gray-200" : "bg-gray-50"
        }`}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        editable={!loading}
      />

      <Pressable
        disabled={loading}
        className="bg-yellow-500 px-10 py-3 rounded-xl mt-6"
        onPress={handleRegister}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="font-bold text-white">Register</Text>
        )}
      </Pressable>

      <Pressable className="mt-6" onPress={() => router.back()}>
        <Text className="text-blue-400">Already have an account? Login</Text>
      </Pressable>
    </View>
  );
}
