import { View, Text } from "react-native";

type Props = {
  avatar?: string | null;
  name: string;
};

export default function CallAvatar({ avatar, name }: Props) {
  return (
    <View className="flex-1 items-center justify-center">
      <View className="h-40 w-40 rounded-full bg-yellow-500 items-center justify-center">
        <Text className="text-6xl font-bold text-white">
          {avatar ?? name.charAt(0)}
        </Text>
      </View>

      <Text className="mt-6 text-white text-3xl font-bold">{name}</Text>
    </View>
  );
}
