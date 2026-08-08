import { Pressable, Text, View } from "react-native";
import { useRef } from "react";

import { Message } from "@/src/api/message";

type Props = {
  message: Message;
  isMine: boolean;

  selected: boolean;
  selectionMode: boolean;

  onSelect: () => void;
  onReply?: () => void;

  onShowReactionPicker?: (
    message: Message,
    position: {
      x: number;
      y: number;
    },
  ) => void;
};

export default function MessageBubble({
  message,
  isMine,
  selected,
  selectionMode,
  onSelect,

  onShowReactionPicker,
}: Props) {
  const bubbleRef = useRef<View>(null);
  return (
    <View
      className={`mb-3 ${isMine ? "items-end" : "items-start"} ${selected ? "bg-gray-200" : ""}`}
    >
      <Pressable
        onPress={() => {
          if (selectionMode) {
            onSelect();
          }
        }}
        onLongPress={() => {
          bubbleRef.current?.measureInWindow((x, y) => {
            onShowReactionPicker?.(message, {
              x,
              y: y - 65,
            });
          });
        }}
        delayLongPress={300}
      >
        {!isMine && (
          <View className="mb-1 ml-2">
            <Text className="text-xs text-gray-500">{message.sender.name}</Text>
          </View>
        )}

        <View
          ref={bubbleRef}
          className={`
            max-w-[80%]
            rounded-2xl
            px-4
            py-3
            ${isMine ? "bg-yellow-500" : "bg-gray-200"}
            
          `}
        >
          {message.replyTo && (
            <View
              className={`mb-2 rounded-xl border-l-4 px-3 py-2 ${
                isMine
                  ? "border-yellow-200 bg-yellow-600"
                  : "border-yellow-500 bg-gray-300"
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  isMine ? "text-yellow-100" : "text-yellow-700"
                }`}
              >
                {message.replyTo.sender.name}
              </Text>

              <Text
                numberOfLines={2}
                className={`mt-1 text-sm ${
                  isMine ? "text-white" : "text-gray-700"
                }`}
              >
                {message.replyTo.deletedAt
                  ? "This message was deleted"
                  : message.replyTo.text}
              </Text>
            </View>
          )}

          <Text className={`italic ${isMine ? "text-white" : "text-gray-600"}`}>
            {message.isDeleted ? "🚫 This message was deleted" : message.text}
          </Text>

          <Text
            className={`mt-2 text-right text-xs ${
              isMine ? "text-yellow-100" : "text-gray-500"
            }`}
          >
            {message.deletedAt ? (
              <>
                Deleted •{" "}
                {new Date(message.deletedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </>
            ) : message.editedAt ? (
              <>
                Edited •{" "}
                {new Date(message.editedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </>
            ) : (
              <>
                {new Date(message.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </>
            )}
          </Text>
        </View>
      </Pressable>

      {message.reactions?.length > 0 && (
        <View
          className={`-mt-1 flex-row flex-wrap ${
            isMine ? "justify-end" : "justify-start"
          }`}
        >
          {message.reactions.map((reaction) => (
            <View
              key={reaction.userId}
              className="mr-1 mb-1 rounded-full bg-gray-100 px-2 py-1"
            >
              <Text className="text-base">{reaction.emoji}</Text>
            </View>
          ))}
        </View>
      )}

      {isMine && (
        <Text
          className="mt-1 text-right text-xs text-gray-400"
          numberOfLines={1}
        >
          {message.optimistic
            ? "Sending..."
            : (message.reads?.length ?? 0) > 0
              ? "Seen"
              : (message.deliveries?.length ?? 0) > 0
                ? "Delivered"
                : "Sent"}
        </Text>
      )}
    </View>
  );
}
