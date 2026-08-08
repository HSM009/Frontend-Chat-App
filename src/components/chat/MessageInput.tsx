import { useEffect, useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { useSendMessage } from "@/src/hooks/useSendMessage";
import { Message, MessageType } from "@/src/api/message";
import { socketService } from "@/src/services/socket";
import { useAuthStore } from "@/src/store/authStore";
import { useEditMessage } from "@/src/hooks/useEditMessage";

type Props = {
  conversationId: string;
  replyTo: Message | null;
  editingMessage: Message | null;
  onCancelReply: () => void;
  onCancelEdit: () => void;
};

export default function MessageInput({
  conversationId,
  replyTo,
  editingMessage,
  onCancelEdit,
  onCancelReply,
}: Props) {
  const [text, setText] = useState("");
  const inputRef = useRef<TextInput>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTyping = useRef(false);

  const currentUser = useAuthStore((state) => state.user);

  const { mutateAsync: sendMessage } = useSendMessage();

  const { mutateAsync: editMessage } = useEditMessage();

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
    const value = text.trim();

    if (!value) return;
    setText("");

    try {
      console.log("Before edit");

      if (editingMessage) {
        const messageId = editingMessage.id;

        onCancelEdit();
        inputRef.current?.blur();
        setText("");

        try {
          await editMessage({
            messageId,
            text: value,
          });
        } catch (error) {
          console.log(error);
        }
      } else {
        await sendMessage({
          conversationId,
          text: value,
          type: MessageType.TEXT,
          ...(replyTo && {
            replyToId: replyTo.id,
          }),
        });

        onCancelReply();
      }

      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }

      isTyping.current = false;
      socketService.sendTyping(conversationId, false);
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

  useEffect(() => {
    if (!editingMessage) return;

    // Only initialize once
    if (text === "") {
      setText(editingMessage.text ?? "");
      inputRef.current?.focus();
    }
  }, [editingMessage]);
  return (
    <View className="border-t border-gray-300 bg-white px-3 py-2">
      {editingMessage && (
        <View className="mb-3 rounded-xl border-l-4 border-blue-500 bg-blue-50 px-3 py-2">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="font-bold text-blue-600">Editing message</Text>

              <Text numberOfLines={1} className="text-gray-600">
                {editingMessage.text}
              </Text>
            </View>

            <Pressable onPress={onCancelEdit}>
              <Text className="text-xl">✕</Text>
            </Pressable>
          </View>
        </View>
      )}
      {replyTo && !editingMessage && (
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
          ref={inputRef}
          className="flex-1 rounded-full border border-gray-300 px-4 py-3"
          placeholder={editingMessage ? "Edit message..." : "Type a message..."}
          value={text}
          onChangeText={handleTyping}
        />

        <Pressable
          onPress={handleSend}
          className={`ml-3 h-12 items-center justify-center rounded-full bg-yellow-500 ${
            editingMessage ? "px-5" : "w-12"
          }`}
        >
          <Text className="text-4xl text-center font-bold text-white">
            {editingMessage ? "✓" : "➤"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
