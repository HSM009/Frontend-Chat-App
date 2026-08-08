import { Pressable, Text, View } from "react-native";

const emojis = ["👍", "❤️", "😂", "😮", "😢", "😡"];

type Props = {
  visible: boolean;
  // x: number;
  y: number;
  onSelect: (emoji: string) => void;
};

export default function ReactionPicker({ visible, y, onSelect }: Props) {
  if (!visible) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: y,
        left: 0,
        right: 0,
        alignItems: "center",
        zIndex: 999,
      }}
    >
      <View className="flex-row rounded-full bg-white px-3 py-2 shadow-lg elevation-5">
        {emojis.map((emoji) => (
          <Pressable
            key={emoji}
            className="mx-2"
            onPress={() => onSelect(emoji)}
          >
            <Text style={{ fontSize: 30 }}>{emoji}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
