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
import MessageActionBar from "@/src/components/chat/MessageActionBar";
import { useMessages } from "@/src/hooks/useMessage";
import { useAuthStore } from "@/src/store/authStore";
import { Keyboard } from "react-native";

import ChatHeader from "@/src/components/chat/ChatHeader";
import MessageBubble from "@/src/components/chat/MessageBubble";
import MessageInput from "@/src/components/chat/MessageInput";
import { Message } from "@/src/api/message";
import { useReadMessage } from "@/src/hooks/useReadMessage";
import { useDeleteMessage } from "@/src/hooks/useDeleteMessage";
import { useConversationSocket } from "@/src/hooks/useConversationSocket";
import ReactionPicker from "@/src/components/chat/ReactionPicker";
import { useReactToMessage } from "@/src/hooks/useReactToMessage";
import IncomingCallModal from "@/src/components/call/IncomingCallModal";
import OutgoingCallModal from "@/src/components/call/OutgoingCallModal";
import { useCreateCall } from "@/src/hooks/useCall";
import { useCallStore } from "@/src/store/callStore";

export default function ConversationScreen() {
  const { outgoingCall, clearOutgoingCall, incomingCall, clearIncomingCall } =
    useCallStore();
  const { conversationId, title, avatar, online, userId } =
    useLocalSearchParams<{
      conversationId: string;
      title: string;
      avatar: string;
      online: string;
      userId: string;
    }>();
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const currentUser = useAuthStore((state) => state.user);
  const [selectedMessages, setSelectedMessages] = useState<Message[]>([]);
  const selectedMessage = selectedMessages[0] ?? null;
  const selectionCount = selectedMessages.length;
  const flatListRef = useRef<FlatList<Message>>(null);

  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const readMutation = useReadMessage();
  const reactMutation = useReactToMessage();
  const { data, isLoading, error } = useMessages(conversationId);
  const messages = data?.messages ?? [];
  const deleteMutation = useDeleteMessage();

  const toggleMessageSelection = (message: Message) => {
    setSelectedMessages((previous) => {
      const exists = previous.some((m) => m.id === message.id);

      if (exists) {
        return previous.filter((m) => m.id !== message.id);
      }

      return [...previous, message];
    });
  };
  const [reactionPosition, setReactionPosition] = useState({
    x: 0,
    y: 0,
  });
  const clearSelection = () => {
    setSelectedMessages([]);
    setShowReactionPicker(false);
  };
  useEffect(() => {
    if (!messages.length || !currentUser?.id) return;

    messages.forEach((message) => {
      const isMine = message.senderId === currentUser.id;

      const alreadyRead = message.reads.some(
        (read) => read.userId === currentUser.id,
      );

      if (!isMine && !alreadyRead) {
        readMutation.mutate(message.id);
      }
    });
  }, [messages, currentUser?.id]);
  useEffect(() => {
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToOffset({
        offset: 0,
        animated: true,
      });
    });
  }, [messages.length]);

  const { isTyping, isOnline } = useConversationSocket({
    conversationId,
    currentUserId: currentUser?.id ?? "",
    userId: userId,
  });
  const createCallMutation = useCreateCall();

  const subtitle = isTyping ? "Typing..." : isOnline ? "Online" : "Offline";
  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () => {
      clearSelection();
    });

    return () => show.remove();
  }, []);

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
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <IncomingCallModal
        visible={!!incomingCall}
        call={incomingCall}
        onClose={clearIncomingCall}
      />

      <OutgoingCallModal
        visible={!!outgoingCall}
        call={outgoingCall?.call ?? null}
        onClose={clearOutgoingCall}
      />

      {/* Header */}
      <View className="mx-4 mt-20">
        <ChatHeader
          title={title}
          subtitle={subtitle}
          avatar={avatar}
          onBack={() => {
            clearSelection();
            router.back();
          }}
          onVoiceCall={() => {
            if (!conversationId || !userId) return;

            createCallMutation.mutate(
              {
                conversationId,
                receiverId: userId,
              },
              {
                onSuccess: (data) => {
                  useCallStore
                    .getState()
                    .startOutgoingCall(data.call, data.receiver);
                },
              },
            );
          }}
        />
      </View>

      {selectionCount > 0 && (
        <MessageActionBar
          selectedMessages={selectedMessages}
          currentUserId={currentUser?.id || "UNKNOWN"}
          onClear={clearSelection}
          onReply={(message) => {
            setEditingMessage(null);
            setReplyTo(message);
          }}
          onEdit={(message) => {
            setReplyTo(null);
            setEditingMessage(message);
          }}
          onDelete={async () => {
            await Promise.all(
              selectedMessages.map((message) =>
                deleteMutation.mutateAsync(message.id),
              ),
            );
            clearSelection();
          }}
          onForward={() => {}}
        />
      )}

      {selectionCount === 1 && (
        <ReactionPicker
          visible={showReactionPicker}
          y={reactionPosition.y + 120}
          onSelect={(emoji) => {
            if (!selectedMessage) return;

            reactMutation.mutate({
              messageId: selectedMessage.id,
              emoji,
            });

            setShowReactionPicker(false);
            clearSelection();
          }}
        />
      )}

      {/* Messages */}
      <View className="flex-1">
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(message) => message.id}
          inverted
          className="flex-1"
          contentContainerStyle={{
            padding: 16,
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          onScrollBeginDrag={() => {
            setShowReactionPicker(false);
          }}
          ListEmptyComponent={() => (
            <View className="flex-1 items-center justify-center">
              <Text className="text-gray-500">No messages yet.</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              isMine={item.senderId === currentUser?.id}
              selected={selectedMessages.some((m) => m.id === item.id)}
              selectionMode={selectionCount > 0}
              onSelect={() => toggleMessageSelection(item)}
              onShowReactionPicker={(message, position) => {
                setSelectedMessages([message]);
                setReactionPosition(position);
                setShowReactionPicker(true);
              }}
            />
          )}
        />
      </View>

      {/* Message input */}
      <View className={`mx-4 ${Platform.OS === "android" ? "mb-16" : "mb-2"}`}>
        <MessageInput
          conversationId={conversationId}
          replyTo={replyTo}
          editingMessage={editingMessage}
          onCancelReply={() => setReplyTo(null)}
          onCancelEdit={() => setEditingMessage(null)}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
