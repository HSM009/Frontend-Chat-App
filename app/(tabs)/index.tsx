import { useConversations } from "@/src/hooks/useConversation";
import { useAuthStore } from "@/src/store/authStore";
import { router } from "expo-router";
import { Plus } from "lucide-react-native";
import { useQueryClient } from "@tanstack/react-query";
import { Conversation } from "@/src/types/conversation";
import { deliverMessage } from "@/src/services/messageService";

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import { useEffect } from "react";
import { socketService } from "@/src/services/socket";
import { WebSocketEvents } from "@/src/types/webSocketEvent";
import {
  MessageDeletedPayload,
  MessageNewPayload,
  MessageReadPayload,
} from "@/src/api/message";

export default function Home() {
  const { data: conversations = [], isLoading, error } = useConversations();
  // console.log("Conversations:", JSON.stringify(conversations, null, 2));

  function newConversationPressable() {
    router.push("/newConversation");
  }

  const currentUser = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  useEffect(() => {
    function handleReadReceipt(payload: MessageReadPayload) {
      queryClient.setQueryData(
        ["conversations"],
        (old: Conversation[] = []) => {
          return old.map((conversation) => {
            if (conversation.id !== payload.conversationId) {
              return conversation;
            }

            return {
              ...conversation,
              unreadCount: 0,
            };
          });
        },
      );
    }

    socketService.subscribe<MessageReadPayload>(
      WebSocketEvents.READ_RECEIPT,
      handleReadReceipt,
    );

    return () => {
      socketService.unsubscribe<MessageReadPayload>(
        WebSocketEvents.READ_RECEIPT,
        handleReadReceipt,
      );
    };
  }, [queryClient]);

  useEffect(() => {
    function handleMessage(payload: MessageNewPayload) {
      console.log("MESSAGE_NEW:", JSON.stringify(payload, null, 2));

      queryClient.setQueryData(
        ["conversations"],
        (old: Conversation[] = []) => {
          return old
            .map((conversation) => {
              if (conversation.id !== payload.conversationId) {
                return conversation;
              }

              return {
                ...conversation,
                lastMessage: payload.message,
                lastMessageAt: payload.lastMessageAt,
              };
            })
            .sort(
              (a, b) =>
                new Date(b.lastMessageAt).getTime() -
                new Date(a.lastMessageAt).getTime(),
            );
        },
      );

      if (payload.message.senderId === currentUser?.id) {
        return;
      }

      deliverMessage(payload.message.id).catch(console.error);
    }
    socketService.subscribe<MessageNewPayload>(
      WebSocketEvents.MESSAGE_NEW,
      handleMessage,
    );
    return () => {
      socketService.unsubscribe<MessageNewPayload>(
        WebSocketEvents.MESSAGE_NEW,
        handleMessage,
      );
    };
  }, [queryClient]);
  useEffect(() => {
    function handleMessageDeleted(payload: MessageDeletedPayload) {
      queryClient.setQueryData(
        ["conversations"],
        (old: Conversation[] = []) => {
          return old.map((conversation) => {
            if (conversation.id !== payload.conversationId) {
              return conversation;
            }

            // Only update if the deleted message is the current last message
            if (conversation.lastMessage?.id !== payload.messageId) {
              return conversation;
            }

            return {
              ...conversation,

              lastMessage: {
                ...conversation.lastMessage,
                text: null,
                isDeleted: true,
              },
            };
          });
        },
      );
    }

    socketService.subscribe<MessageDeletedPayload>(
      WebSocketEvents.MESSAGE_DELETED,
      handleMessageDeleted,
    );

    return () => {
      socketService.unsubscribe<MessageDeletedPayload>(
        WebSocketEvents.MESSAGE_DELETED,
        handleMessageDeleted,
      );
    };
  }, [queryClient]);
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#EAB308" />
      </View>
    );
  }

  if (error) {
    console.log(error);

    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-lg text-red-500">
          Failed to load conversations.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <Text className="mx-4 mt-20 mb-4 border-b border-gray-300 pb-3 text-center text-3xl font-extrabold tracking-widest text-yellow-500">
        Conversations
      </Text>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          flexGrow: 1,
        }}
        ListEmptyComponent={() => (
          <View className="flex-1 items-center justify-center px-8">
            <View className="h-24 w-24 items-center justify-center rounded-full bg-yellow-100">
              <Pressable onPress={newConversationPressable}>
                <Plus size={42} color="#EAB308" />
              </Pressable>
            </View>

            <Text className="mt-6 text-2xl font-bold text-gray-800">
              No Conversations
            </Text>

            <Text className="mt-2 text-center text-gray-500">
              Start chatting by creating your first conversation.
            </Text>

            <Pressable
              className="mt-8 flex-row items-center rounded-2xl bg-yellow-500 px-8 py-4"
              onPress={newConversationPressable}
            >
              <Plus size={20} color="white" />

              <Text className="ml-2 font-bold text-white">
                New Conversation
              </Text>
            </Pressable>
          </View>
        )}
        renderItem={({ item }) => {
          const otherUser = item.participants.find(
            (p) => p.user.id !== currentUser?.id,
          )?.user;

          const title = item.isGroup
            ? item.name
            : (otherUser?.name ?? "Unknown User");

          const avatar = title?.charAt(0).toUpperCase();

          return (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/chat/[conversationId]",
                  params: {
                    conversationId: item.id,
                    title,
                    avatar,
                    online: otherUser?.isOnline ? "1" : "0",
                    userId: otherUser?.id,
                  },
                })
              }
              className="flex-row items-center justify-between border-b border-gray-200 px-5 py-4"
            >
              <View className="flex-1 flex-row items-center">
                <View className="h-14 w-14 items-center justify-center rounded-full bg-yellow-500">
                  <Text className="text-xl font-bold text-white">{avatar}</Text>
                </View>

                <View className="ml-4 flex-1">
                  <Text className="text-lg font-bold" numberOfLines={1}>
                    {title}
                  </Text>

                  <Text className="mt-1 text-gray-500" numberOfLines={1}>
                    {item.lastMessage?.text ?? "No messages yet"}
                  </Text>
                </View>
              </View>

              <View className="items-end">
                {!item.isGroup && (
                  <Text
                    className={`text-xs ${
                      otherUser?.isOnline ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    {otherUser?.isOnline ? "Online" : "Offline"}
                  </Text>
                )}

                {item.unreadCount > 0 && (
                  <View className="mt-2 h-6 w-6 items-center justify-center rounded-full bg-green-500">
                    <Text className="text-xs font-bold text-white">
                      {item.unreadCount}
                    </Text>
                  </View>
                )}
              </View>
            </Pressable>
          );
        }}
      />

      {conversations.length > 0 && (
        <Pressable
          onPress={newConversationPressable}
          className="absolute bottom-8 right-6 h-16 w-16 items-center justify-center rounded-full bg-yellow-500 shadow-lg"
        >
          <Plus size={30} color="white" />
        </Pressable>
      )}
    </View>
  );
}
