import { View, Text } from "react-native";

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-4xl font-bold text-black animate-pulse tracking-widest">
        HSM APP
      </Text>

      <Text className="mt-4 text-xs text-green-400">NativeWind Working!</Text>
    </View>
  );
}
