import { useQueryClient } from "@tanstack/react-query";

import { useLocalSearchParams, router } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { socketService } from "@/src/services/socket";
import { WebSocketEvents } from "@/src/types/webSocketEvent";
import { useMessages } from "@/src/hooks/useMessage";
import { useAuthStore } from "@/src/store/authStore";

import ChatHeader from "@/src/components/chat/ChatHeader";
import MessageBubble from "@/src/components/MessageBubble";
import MessageInput from "@/src/components/chat/MessageInput";
import {
  Message,
  MessageNewPayload,
  MessageReadPayload,
} from "@/src/api/message";
import { useReadMessage } from "@/src/hooks/useReadMessage";

export default function ConversationScreen() {
  const { conversationId, title, avatar, online, userId } =
    useLocalSearchParams<{
      conversationId: string;
      title: string;
      avatar: string;
      online: string;
      userId: string;
    }>();
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const currentUser = useAuthStore((state) => state.user);
  const readMutation = useReadMessage();
  const queryClient = useQueryClient();
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { data, isLoading, error } = useMessages(conversationId);
  const [isOnline, setIsOnline] = useState(online === "true" || online === "1");
  const messages = data?.messages ?? [];
  useEffect(() => {
    messages.forEach((message) => {
      if (message.senderId !== currentUser?.id && message.reads.length === 0) {
        readMutation.mutate(message.id);
      }
    });
  }, [messages]);
  const subtitle = isTyping ? "Typing..." : isOnline ? "Online" : "Offline";

  useEffect(() => {
    function handleOnline(payload: { userId: string }) {
      if (payload.userId !== userId) return;

      setIsOnline(true);
    }

    socketService.subscribe(
      WebSocketEvents.USER_ONLINE,
      handleOnline as (payload: unknown) => void,
    );

    return () => {
      socketService.unsubscribe(
        WebSocketEvents.USER_ONLINE,
        handleOnline as (payload: unknown) => void,
      );
    };
  }, [userId]);
  useEffect(() => {
    function handleOffline(payload: { userId: string }) {
      if (payload.userId !== userId) return;

      setIsOnline(false);
    }

    socketService.subscribe(
      WebSocketEvents.USER_OFFLINE,
      handleOffline as (payload: unknown) => void,
    );

    return () => {
      socketService.unsubscribe(
        WebSocketEvents.USER_OFFLINE,
        handleOffline as (payload: unknown) => void,
      );
    };
  }, [userId]);

  useEffect(() => {
    function handleTyping(payload: {
      conversationId: string;
      userId: string;
      typing: boolean;
    }) {
      if (payload.conversationId !== conversationId) return;

      if (payload.userId !== userId) return;

      if (payload.typing) {
        setIsTyping(true);

        if (typingTimeout.current) {
          clearTimeout(typingTimeout.current);
        }

        typingTimeout.current = setTimeout(() => {
          setIsTyping(false);
        }, 2000);
      }
    }

    socketService.subscribe(WebSocketEvents.USER_TYPING, handleTyping);

    return () => {
      socketService.unsubscribe(WebSocketEvents.USER_TYPING, handleTyping);
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
    };
  }, [conversationId, userId]);

  useEffect(() => {
    function handleMessage(payload: MessageNewPayload) {
      if (payload.conversationId !== conversationId) {
        return;
      }

      queryClient.setQueryData(["messages", conversationId], (old: any) => {
        if (!old) return old;

        const exists = old.messages.some(
          (message: Message) => message.id === payload.message.id,
        );

        if (exists) {
          return old;
        }

        return {
          ...old,
          messages: [payload.message, ...old.messages],
        };
      });
      if (
        payload.message.senderId !== currentUser?.id &&
        payload.message.reads.length === 0
      ) {
        readMutation.mutate(payload.message.id);
      }
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
  }, [conversationId, queryClient, currentUser?.id]);
  useEffect(() => {
    function handleReadReceipt(payload: MessageReadPayload) {
      queryClient.setQueryData(["messages", conversationId], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          messages: old.messages.map((message: Message) => {
            if (message.id !== payload.messageId) {
              return message;
            }

            return {
              ...message,
              reads: [
                ...message.reads,
                {
                  userId: payload.userId,
                  readAt: payload.readAt,
                },
              ],
            };
          }),
        };
      });
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
  }, [conversationId, queryClient]);
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
        <Text className="text-lg text-red-500">Failed to load messages.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <View className="mx-4 mt-20">
        <ChatHeader
          title={title}
          subtitle={isTyping ? "Typing..." : subtitle}
          avatar={avatar}
          onBack={() => router.back()}
        />
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: 16,
          flexGrow: 1,
        }}
        ListEmptyComponent={() => (
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-500">No messages yet.</Text>
          </View>
        )}
        inverted
        renderItem={({ item }) => (
          <MessageBubble
            message={item}
            isMine={item.senderId === currentUser?.id}
            onReply={() => setReplyTo(item)}
          />
        )}
      />
      <View className=" mb-12 mx-4">
        <MessageInput
          conversationId={conversationId}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
