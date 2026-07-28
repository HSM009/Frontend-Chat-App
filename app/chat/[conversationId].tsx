import { useLocalSearchParams, router } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { MoveLeft } from "lucide-react-native";

import { useMessages } from "@/src/hooks/useMessage";
import { useAuthStore } from "@/src/store/authStore";
import { useSendMessage } from "@/src/hooks/useSendMessage";
import { useState } from "react";
import MessageBubble from "@/src/components/MessageBubble";
import ChatHeader from "@/src/components/chat/ChatHeader";

export default function ConversationScreen() {
  const { conversationId, title, avatar, online } = useLocalSearchParams<{
    conversationId: string;
    title: string;
    avatar: string;
    online: string;
  }>();

  const currentUser = useAuthStore((state) => state.user);
  const { data, isLoading, error } = useMessages(conversationId);
  const messages = data?.messages ?? [];

  const [text, setText] = useState("");
  const { mutateAsync, isPending } = useSendMessage();
  async function handleSend() {
    if (!text.trim()) return;

    try {
      await mutateAsync({
        conversationId,
        text,
      });

      setText("");
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
        <Text className="text-red-500 text-lg">Failed to load messages.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ChatHeader
        title={title}
        subtitle={subtitle}
        avatar={avatar}
        onBack={() => router.back()}
      />

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: 16,
        }}
        renderItem={({ item }) => (
          <MessageBubble
            message={item}
            isMine={item.senderId === currentUser?.id}
          />
        )}
        ListEmptyComponent={() => (
          <View className="mt-10 items-center">
            <Text className="text-gray-500">No messages yet.</Text>
          </View>
        )}
      />
      <View className="border-t border-gray-300 bg-white px-3 py-2">
        <View className="flex-row items-center">
          <TextInput
            className="flex-1 rounded-full border border-gray-300 px-4 py-3"
            placeholder="Type a message..."
            value={text}
            editable={!isPending}
            onChangeText={setText}
          />

          <Pressable
            disabled={isPending}
            onPress={handleSend}
            className="ml-3 h-12 w-12 items-center justify-center rounded-full bg-yellow-500"
          >
            {isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-lg font-bold text-white">➤</Text>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}
