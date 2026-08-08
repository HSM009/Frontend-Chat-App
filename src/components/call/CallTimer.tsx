import { View, Text } from "react-native";

type Props = {
  status: string;
  time: string;
};

export default function CallTimer({ status, time }: Props) {
  return (
    <View className="items-center">
      <Text className="text-gray-400">{status}</Text>

      <Text className="mt-2 text-2xl text-white font-bold">{time}</Text>
    </View>
  );
}
