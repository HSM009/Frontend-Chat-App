import { Modal, Pressable, Text, View } from "react-native";

import { IncomingCallPayload } from "@/src/api/call";
import { useAcceptCall, useRejectCall } from "@/src/hooks/useCall";

type Props = {
  visible: boolean;
  call: IncomingCallPayload | null;
  onClose: () => void;
};

export default function IncomingCallModal({ visible, call, onClose }: Props) {
  const acceptMutation = useAcceptCall();
  const rejectMutation = useRejectCall();

  if (!call) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/40">
        <View className="w-[90%] rounded-3xl bg-white p-6">
          <Text className="text-center text-xl font-bold">Incoming Call</Text>

          <Text className="mt-2 text-center text-lg">{call.caller.name}</Text>

          <View className="mt-8 flex-row justify-around">
            <Pressable
              className="rounded-full bg-red-500 px-6 py-3"
              onPress={() => {
                rejectMutation.mutate(
                  { callId: call.callId },
                  {
                    onSuccess: onClose,
                  },
                );
              }}
            >
              <Text className="font-bold text-white">Reject</Text>
            </Pressable>

            <Pressable
              className="rounded-full bg-green-500 px-6 py-3"
              onPress={() => {
                acceptMutation.mutate(
                  { callId: call.callId },
                  {
                    onSuccess: onClose,
                  },
                );
              }}
            >
              <Text className="font-bold text-white">Accept</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
