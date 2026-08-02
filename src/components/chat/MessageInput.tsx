import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { useSendMessage } from "@/src/hooks/useSendMessage";
import { Message, MessageType } from "../../api/message";
import { useRef } from "react";
import { socketService } from "@/src/services/socket";

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

  const { mutateAsync, isPending } = useSendMessage();
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
    if (!text.trim()) return;

    try {
      await mutateAsync({
        conversationId,
        type: MessageType.TEXT,
        text,
      });
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
      isTyping.current = false;
      socketService.sendTyping(conversationId, false);
      setText("");
    } catch (error) {
      console.log(error);
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
      <View className="flex-row items-center">
        {replyTo && (
          <View className="mx-3 mb-2 rounded-xl border-l-4 border-yellow-500 bg-gray-100 p-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="font-bold text-yellow-600">
                  Replying to {replyTo.sender.name}
                </Text>

                <Text numberOfLines={1} className="mt-1 text-gray-600">
                  {replyTo.text}
                </Text>
              </View>

              <Pressable onPress={onCancelReply}>
                <Text className="px-2 text-xl text-gray-500">✕</Text>
              </Pressable>
            </View>
          </View>
        )}
        <TextInput
          className="flex-1 rounded-full border border-gray-300 px-4 py-3"
          placeholder="Type a message..."
          value={text}
          editable={!isPending}
          onChangeText={handleTyping}
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
  );
}
