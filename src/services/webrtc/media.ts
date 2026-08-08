import { mediaDevices } from "react-native-webrtc";

export async function getLocalAudioStream() {
  return mediaDevices.getUserMedia({
    audio: true,
    video: false,
  });
}
