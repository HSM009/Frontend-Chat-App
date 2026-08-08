import * as Clipboard from "expo-clipboard";
import { Pressable, Text, View } from "react-native";

import { Message } from "@/src/api/message";

type Props = {
  selectedMessages: Message[];
  currentUserId: string;

  onClear: () => void;
  onReply: (message: Message) => void;
  onEdit: (message: Message) => void;
  onDelete: () => void;
  onForward: () => void;
  // onReaction: () => void;
};

export default function MessageActionBar({
  selectedMessages,
  currentUserId,
  onClear,
  onReply,
  onEdit,
  onDelete,
  onForward,
  // onReaction,
}: Props) {
  const selectionCount = selectedMessages.length;
  const selectedMessage = selectedMessages[0];
  const canReply = selectionCount === 1;
  // const canReact = selectionCount === 1;
  const canCopy = selectionCount > 0;
  const canDelete = selectionCount > 0;
  const canForward = selectionCount > 0;
  const canEdit =
    selectionCount === 1 &&
    selectedMessage.sender.id === currentUserId &&
    selectedMessage.type === "TEXT" &&
    !selectedMessage.isDeleted;

  async function handleCopy() {
    const text = selectedMessages
      .map((message) => message.text ?? "")
      .join("\n");

    await Clipboard.setStringAsync(text);

    onClear();
  }

  return (
    <View className="h-14 flex-row items-center justify-between border-b border-gray-300 bg-white px-3 mx-3">
      <View className="flex-row items-center">
        {/* <Pressable onPress={onClear}>
          <Text className="mr-5 text-xl px-2">X</Text>
        </Pressable> */}

        <Text className="text-lg font-bold px-2">{selectionCount}</Text>
      </View>

      <View className="flex-row items-center">
        {/* {canReact && (
          <Pressable
            onPress={() => {
              onReaction();
              onClear();
            }}
          >
            <Text className="mx-2 text-xl">😀</Text>
          </Pressable>
        )} */}

        {canReply && (
          <Pressable
            onPress={() => {
              onReply(selectedMessage);
              onClear();
            }}
          >
            <Text className="mx-2 text-xl">↩️</Text>
          </Pressable>
        )}

        {canCopy && (
          <Pressable onPress={handleCopy}>
            <Text className="mx-2 text-xl">📋</Text>
          </Pressable>
        )}

        {canEdit && (
          <Pressable
            onPress={() => {
              onEdit(selectedMessage);
              onClear();
            }}
          >
            <Text className="mx-2 text-xl">✏️</Text>
          </Pressable>
        )}

        {canDelete && (
          <Pressable
            onPress={() => {
              onDelete();
              onClear();
            }}
          >
            <Text className="mx-2 text-xl">🗑️</Text>
          </Pressable>
        )}

        {canForward && (
          <Pressable
            onPress={() => {
              onForward();
              onClear();
            }}
          >
            <Text className="ml-2 text-xl">➡️</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
