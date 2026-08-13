import { useState } from "react";
import { Button, Text, View } from "react-native";
import { mediaDevices, MediaStream } from "react-native-webrtc";

export default function WebRTCTestScreen() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState("Not tested");

  const testWebRTC = async () => {
    try {
      setStatus("Requesting camera and microphone...");

      const mediaStream = await mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      setStream(mediaStream);

      setStatus(
        `SUCCESS - audio: ${mediaStream.getAudioTracks().length}, video: ${mediaStream.getVideoTracks().length}`,
      );
    } catch (error) {
      console.error("WebRTC error:", error);
      setStatus(`ERROR: ${String(error)}`);
    }
  };

  const stopWebRTC = () => {
    stream?.getTracks().forEach((track) => track.stop());

    setStream(null);
    setStatus("Stopped");
  };

  return (
    <View className="flex-1 items-center justify-center px-6">
      <Text className="mb-6 text-xl font-bold">WebRTC Test</Text>

      <Text className="mb-6 text-center">{status}</Text>

      {!stream ? (
        <Button title="Test Camera + Microphone" onPress={testWebRTC} />
      ) : (
        <Button title="Stop Test" onPress={stopWebRTC} />
      )}
    </View>
  );
}
