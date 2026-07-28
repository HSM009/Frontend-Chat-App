import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  TextInput,
  FlatList,
} from "react-native";
import { router } from "expo-router";
import { MoveLeft, Search, Phone } from "lucide-react-native";

import { useUsers } from "@/src/hooks/useUser";
import { useCreateConversation } from "@/src/hooks/useConversation";

export default function NewConversation() {
  const { data: users = [], isLoading, error } = useUsers();
  const { mutateAsync, isPending } = useCreateConversation();
  const [search, setSearch] = useState("");

  function goBack() {
    router.back();
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.phone.includes(search),
  );

  async function handleSelectUser(
    userId: string,
    name: string,
    isOnline: string,
  ) {
    try {
      const conversation = await mutateAsync(userId);
      router.replace({
        pathname: "/chat/[conversationId]",
        params: {
          conversationId: conversation.id,
          titlle: name,
          avatar: name.charAt(0).toUpperCase(),
          online: isOnline,
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#EAB308" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-lg text-red-500">Failed to load users.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="mx-4 mt-20 mb-4 flex-row items-center border-b border-gray-300 pb-3">
        <Pressable
          onPress={goBack}
          className="h-10 w-10 items-center justify-center rounded-full bg-yellow-500"
        >
          <MoveLeft size={22} color="white" />
        </Pressable>

        <View className="flex-1 items-center">
          <Text className="text-2xl font-bold text-yellow-500">
            New Conversation
          </Text>
        </View>

        <View className="w-10" />
      </View>

      {/* Search */}

      <View className="mx-4 mb-3 flex-row items-center rounded-xl border border-gray-300 px-4">
        <Search size={18} color="gray" />

        <TextInput
          className="ml-3 flex-1 py-3"
          placeholder="Search by name or phone..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingBottom: 20,
          flexGrow: filteredUsers.length === 0 ? 1 : 0,
        }}
        ListEmptyComponent={() => (
          <View className="flex-1 items-center justify-center">
            <Text className="text-lg text-gray-500">No users found.</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <Pressable
            disabled={isPending}
            android_ripple={{ color: "#FDE68A" }}
            onPress={() =>
              handleSelectUser(item.id, item.name, item.isOnline ? "1" : "0")
            }
            className={`mx-4 flex-row items-center border-b border-gray-200 px-5 py-4 ${
              isPending ? "opacity-50" : ""
            }`}
          >
            <View className="h-12 w-12 items-center justify-center rounded-full bg-yellow-500">
              <Text className="text-lg font-bold text-white">
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </View>

            <View className="ml-4 flex-1">
              <Text className="text-lg font-bold">{item.name}</Text>

              <Text className="text-gray-500">{item.phone}</Text>
            </View>

            {/* Right Side */}

            {isPending ? (
              <ActivityIndicator size="small" color="#EAB308" />
            ) : (
              <View
                className={`h-3 w-3 rounded-full ${
                  item.isOnline ? "bg-green-500 animate-pulse" : "bg-gray-400"
                }`}
              />
            )}
          </Pressable>
        )}
      />
    </View>
  );
}
