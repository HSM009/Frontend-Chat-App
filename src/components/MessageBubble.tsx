import { View, Text, Pressable } from "react-native";
import { Message } from "@/src/api/message";

type Props = {
  message: Message;
  isMine: boolean;
  onReply?: () => void;
};

export default function MessageBubble({ message, isMine, onReply }: Props) {
  console.log("Message:", {
    id: message.id,
    text: message.text,
    replyTo: message.replyTo,
  });
  return (
    <Pressable
      onLongPress={onReply}
      delayLongPress={300}
      className={`mb-3 ${isMine ? "items-end" : "items-start"}`}
    >
      {!isMine && (
        <View className=" mb-1 ml-2`">
          <Text className=" text-xs text-gray-500">{message.sender.name}</Text>
        </View>
      )}

      <View
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isMine ? " bg-yellow-500" : "bg-gray-200"
        }`}
      >
        <>
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

          <Text className={isMine ? "text-white" : "text-black"}>
            {message.isDeleted ? "This message was deleted." : message.text}
          </Text>
        </>

        <Text
          className={`mt-2 text-right text-[10px] ${
            isMine ? "text-yellow-100" : "text-gray-500"
          }`}
        >
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
      {isMine && (
        <Text className=" text-right text-xs text-gray-400">
          {message.reads?.length > 0 ? "Seen" : "Sent"}
        </Text>
      )}
    </Pressable>
  );
}
