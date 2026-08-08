import { PermissionsAndroid, Platform } from "react-native";

export async function requestMicrophonePermission() {
  if (Platform.OS !== "android") {
    return true;
  }

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
  );

  return granted === PermissionsAndroid.RESULTS.GRANTED;
}
