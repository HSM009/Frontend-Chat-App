import { View, Text, Pressable } from "react-native";
import { MoveLeft, Phone, Video, EllipsisVertical } from "lucide-react-native";

type Props = {
  title: string;
  subtitle?: string;
  avatar?: string;
  onBack: () => void;
  onVoiceCall: () => void;
};

export default function ChatHeader({
  title,
  subtitle,
  avatar,
  onBack,
  onVoiceCall,
}: Props) {
  return (
    <View className="mt-14 flex-row items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
      <View className="flex-row items-center flex-1">
        <Pressable onPress={onBack} className="mr-3">
          <MoveLeft size={24} color="black" />
        </Pressable>

        <View className="h-12 w-12 items-center justify-center rounded-full bg-yellow-500">
          <Text className="text-lg font-bold text-white">{avatar}</Text>
        </View>

        <View className="ml-3 flex-1">
          <Text numberOfLines={1} className="text-lg font-bold">
            {title}
          </Text>

          {!!subtitle && (
            <Text numberOfLines={1} className="text-xs text-gray-500">
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      <View className="flex-row items-center">
        <Pressable className="p-2" onPress={onVoiceCall}>
          <Phone size={22} color="black" />
        </Pressable>

        <Pressable className="mr-4 p-2">
          <Video size={22} color="black" />
        </Pressable>

        <Pressable className="mr-4 p-2">
          <EllipsisVertical size={22} color="black" />
        </Pressable>
      </View>
    </View>
  );
}
