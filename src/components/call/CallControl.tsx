import { Pressable, View } from "react-native";
import { Mic, Volume2, PhoneOff } from "lucide-react-native";

type Props = {
  onEnd: () => void;
};

export default function CallControls({ onEnd }: Props) {
  return (
    <View className="mb-16 flex-row justify-evenly">
      <Pressable className="h-16 w-16 rounded-full bg-gray-700 items-center justify-center">
        <Mic color="white" size={28} />
      </Pressable>

      <Pressable className="h-16 w-16 rounded-full bg-gray-700 items-center justify-center">
        <Volume2 color="white" size={28} />
      </Pressable>

      <Pressable
        onPress={onEnd}
        className="h-16 w-16 rounded-full bg-red-500 items-center justify-center"
      >
        <PhoneOff color="white" size={28} />
      </Pressable>
    </View>
  );
}
