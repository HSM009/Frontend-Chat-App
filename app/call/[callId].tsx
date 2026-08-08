import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

import { useCallStore } from "@/src/store/callStore";
import { useEndCall } from "@/src/hooks/useCall";
import CallHeader from "@/src/components/call/CallHeader";
import CallAvatar from "@/src/components/call/CallAvatar";
import CallTimer from "@/src/components/call/CallTimer";
import CallControls from "@/src/components/call/CallControl";
import { useCallTimer } from "@/src/components/call/UseCallTimer";
import { useEffect } from "react";
import { webRtcService } from "@/src/services/webrtc/WebRTCService";
import { socketService } from "@/src/services/socket";
import { WebSocketEvents } from "@/src/types/webSocketEvent";

export default function CallScreen() {
  const { callId } = useLocalSearchParams<{
    callId: string;
  }>();

  useEffect(() => {
    async function startCall() {
      await webRtcService.initialize();

      if (outgoingCall) {
        const offer = await webRtcService.createOffer();

        socketService.send(WebSocketEvents.WEBRTC_OFFER, {
          callId,
          receiverId: outgoingCall.receiver.id,
          conversationId: outgoingCall.call.conversationId,
          offer,
        });
      }
    }

    startCall();

    return () => {
      webRtcService.endCall();
    };
  }, []);

  const { outgoingCall, incomingCall, clearOutgoingCall, clearIncomingCall } =
    useCallStore();

  const endCallMutation = useEndCall();

  const { time } = useCallTimer();

  const receiver =
    outgoingCall?.receiver ??
    (incomingCall
      ? {
          id: incomingCall.caller.id,
          name: incomingCall.caller.name,
          avatar: incomingCall.caller.avatar,
        }
      : null);

  useEffect(() => {
    async function handleOffer(payload: {
      callerId: string;
      conversationId: string;
      offer: RTCSessionDescriptionInit;
    }) {
      console.log("Offer received");

      await webRtcService.initialize();

      await webRtcService.setRemoteOffer(payload.offer);

      const answer = await webRtcService.createAnswer();

      socketService.send(WebSocketEvents.WEBRTC_ANSWER, {
        callId,
        receiverId: payload.callerId,
        answer,
      });
    }

    async function handleAnswer(payload: {
      answer: RTCSessionDescriptionInit;
    }) {
      console.log("Answer received");

      await webRtcService.setRemoteAnswer(payload.answer);
    }
    async function handleIce(payload: { candidate: RTCIceCandidate }) {
      console.log("ICE Candidate");

      await webRtcService.addIceCandidate(payload.candidate);
    }

    socketService.subscribe(WebSocketEvents.WEBRTC_OFFER, handleOffer);

    socketService.subscribe(WebSocketEvents.WEBRTC_ANSWER, handleAnswer);

    socketService.subscribe(WebSocketEvents.WEBRTC_ICE, handleIce);

    return () => {
      socketService.unsubscribe(WebSocketEvents.WEBRTC_OFFER, handleOffer);

      socketService.unsubscribe(WebSocketEvents.WEBRTC_ANSWER, handleAnswer);

      socketService.unsubscribe(WebSocketEvents.WEBRTC_ICE, handleIce);
    };
  }, []);

  useEffect(() => {
    webRtcService.setSignalHandler((signal) => {
      if (signal.type !== "ice-candidate") {
        return;
      }

      socketService.send(WebSocketEvents.WEBRTC_ICE, {
        callId,
        receiverId: outgoingCall?.receiver.id ?? incomingCall?.caller.id,
        candidate: signal.candidate,
      });
    });
  }, [callId, outgoingCall, incomingCall]);
  return (
    <View className="flex-1 bg-black">
      <CallHeader />

      <CallAvatar avatar={receiver?.avatar} name={receiver?.name ?? ""} />

      <CallTimer status="Connected" time={time} />

      <CallControls
        onEnd={() => {
          endCallMutation.mutate(callId, {
            onSuccess: () => {
              clearOutgoingCall();
              clearIncomingCall();

              router.dismissAll();
            },
          });
        }}
      />
    </View>
  );
}
