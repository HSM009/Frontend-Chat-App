import { Modal, Pressable, Text, View } from "react-native";
import { PhoneOff } from "lucide-react-native";

import { Call } from "@/src/api/call";

type Props = {
  visible: boolean;
  call: Call | null;
  onClose: () => void;
};

export default function OutgoingCallModal({ visible, call, onClose }: Props) {
  if (!call) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/60">
        <View className="w-[90%] rounded-3xl bg-white p-8 items-center">
          <View className="mb-5 h-24 w-24 items-center justify-center rounded-full bg-yellow-500">
            <Text className="text-4xl font-bold text-white">📞</Text>
          </View>

          <Text className="text-2xl font-bold">Calling...</Text>

          <Text className="mt-2 text-gray-500">Status: {call.status}</Text>

          <View className="mt-8">
            <Pressable
              onPress={onClose}
              className="h-16 w-16 items-center justify-center rounded-full bg-red-500"
            >
              <PhoneOff color="white" size={30} />
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
