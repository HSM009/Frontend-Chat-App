import { View, Text } from "react-native";
import { Message } from "@/src/api/message";

type Props = {
  message: Message;
  isMine: boolean;
};

export default function MessageBubble({ message, isMine }: Props) {
  return (
    <View className={`mb-3 ${isMine ? "items-end" : "items-start"}`}>
      {!isMine && (
        <Text className="mb-1 ml-2 text-xs text-gray-500">
          {message.sender.name}
        </Text>
      )}

      <View
        className={`max-w-[80%] rounded-3xl px-4 py-3 ${
          isMine ? "bg-yellow-500" : "bg-gray-200"
        }`}
      >
        <Text className={isMine ? "text-white" : "text-black"}>
          {message.isDeleted ? "This message was deleted." : message.text}
        </Text>

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
    </View>
  );
}
