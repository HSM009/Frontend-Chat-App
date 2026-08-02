import { useEffect, useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { useSendMessage } from "@/src/hooks/useSendMessage";
import { Message, MessageType } from "@/src/api/message";
import { socketService } from "@/src/services/socket";
import { useAuthStore } from "@/src/store/authStore";

type Props = {
  conversationId: string;
  replyTo: Message | null;
  onCancelReply: () => void;
};

export default function MessageInput({
  conversationId,
  replyTo,
  onCancelReply,
}: Props) {
  const [text, setText] = useState("");

  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTyping = useRef(false);

  const currentUser = useAuthStore((state) => state.user);

  const { mutateAsync } = useSendMessage();

  function handleTyping(value: string) {
    setText(value);

    if (!conversationId) return;

    if (!isTyping.current) {
      isTyping.current = true;
      socketService.sendTyping(conversationId, true);
    }

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    typingTimeout.current = setTimeout(() => {
      isTyping.current = false;
      socketService.sendTyping(conversationId, false);
    }, 1000);
  }

  async function handleSend() {
    const messageText = text.trim();

    if (!messageText) return;

    // Clear input immediately
    setText("");

    // Remove reply preview immediately
    const selectedReply = replyTo;
    onCancelReply();

    // Stop typing
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    isTyping.current = false;
    socketService.sendTyping(conversationId, false);

    try {
      await mutateAsync({
        conversationId,
        text: messageText,
        type: MessageType.TEXT,
        ...(selectedReply && {
          replyToId: selectedReply.id,
        }),
      });
    } catch (error) {
      console.log("Send message failed:", error);

      // Later we can add failed message retry here
    }
  }

  useEffect(() => {
    return () => {
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }

      if (isTyping.current && conversationId) {
        socketService.sendTyping(conversationId, false);
      }
    };
  }, [conversationId]);

  return (
    <View className="border-t border-gray-300 bg-white px-3 py-2">
      {replyTo && (
        <View className="mb-3 flex-row items-center rounded-xl border-l-4 border-yellow-500 bg-gray-100 px-3 py-2">
          <View className="flex-1">
            <Text className="text-xs font-bold text-yellow-600">
              ↩ Replying to{" "}
              {replyTo.sender.id === currentUser?.id
                ? "You"
                : replyTo.sender.name}
            </Text>

            <Text numberOfLines={1} className="mt-1 text-sm text-gray-700">
              {replyTo.text ?? "Attachment"}
            </Text>
          </View>

          <Pressable hitSlop={10} onPress={onCancelReply}>
            <Text className="px-2 text-xl text-gray-500">✕</Text>
          </Pressable>
        </View>
      )}

      <View className="flex-row items-center">
        <TextInput
          className="flex-1 rounded-full border border-gray-300 px-4 py-3"
          placeholder="Type a message..."
          value={text}
          onChangeText={handleTyping}
        />

        <Pressable
          onPress={handleSend}
          className="ml-3 h-12 w-12 items-center justify-center rounded-full bg-yellow-500"
        >
          <Text className="text-lg font-bold text-white">➤</Text>
        </Pressable>
      </View>
    </View>
  );
}
