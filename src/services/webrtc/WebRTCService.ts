// src/services/webRtcService.ts

import {
  mediaDevices,
  MediaStream,
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
} from "react-native-webrtc";

type SignalCallback = (data: any) => void;
type StreamCallback = (stream: MediaStream) => void;

class WebRTCService {
  private peer: RTCPeerConnection | null = null;

  private localStream: MediaStream | null = null;

  private remoteStream: MediaStream | null = null;

  private onSignalCallback?: SignalCallback;

  private onRemoteStreamCallback?: StreamCallback;

  constructor() {}

  setSignalHandler(callback: SignalCallback) {
    this.onSignalCallback = callback;
  }

  setRemoteStreamHandler(callback: StreamCallback) {
    this.onRemoteStreamCallback = callback;
  }

  async initialize() {
    if (this.peer) {
      return;
    }

    this.peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
        {
          urls: "turn:YOUR_SERVER_IP:3478",
          username: "chatuser",
          credential: "password123",
        },
      ],
    });

    this.localStream = await mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });

    this.localStream.getTracks().forEach((track: any) => {
      this.peer!.addTrack(track, this.localStream!);
    });

    this.remoteStream = new MediaStream();

    this.peer.ontrack = (event: any) => {
      event.streams[0].getTracks().forEach((track: any) => {
        this.remoteStream!.addTrack(track);
      });

      if (this.onRemoteStreamCallback && this.remoteStream) {
        this.onRemoteStreamCallback(this.remoteStream);
      }
    };

    this.peer.onicecandidate = (event: any) => {
      if (!event.candidate) {
        return;
      }

      this.onSignalCallback?.({
        type: "ice-candidate",
        candidate: event.candidate,
      });
    };

    this.peer.onconnectionstatechange = () => {
      console.log("Connection State:", this.peer?.connectionState);
    };

    this.peer.oniceconnectionstatechange = () => {
      console.log("ICE State:", this.peer?.iceConnectionState);
    };
  }

  async createOffer() {
    if (!this.peer) {
      throw new Error("Peer connection not initialized");
    }

    const offer = await this.peer.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: false,
    });

    await this.peer.setLocalDescription(offer);

    return offer;
  }

  async createAnswer() {
    if (!this.peer) {
      throw new Error("Peer connection not initialized");
    }

    const answer = await this.peer.createAnswer();

    await this.peer.setLocalDescription(answer);

    return answer;
  }

  async setRemoteOffer(offer: any) {
    if (!this.peer) {
      throw new Error("Peer connection not initialized");
    }

    await this.peer.setRemoteDescription(new RTCSessionDescription(offer));
  }

  async setRemoteAnswer(answer: any) {
    if (!this.peer) {
      throw new Error("Peer connection not initialized");
    }

    await this.peer.setRemoteDescription(new RTCSessionDescription(answer));
  }

  async addIceCandidate(candidate: any) {
    if (!this.peer) {
      return;
    }

    await this.peer.addIceCandidate(new RTCIceCandidate(candidate));
  }

  getLocalStream() {
    return this.localStream;
  }

  getRemoteStream() {
    return this.remoteStream;
  }

  async toggleMute() {
    if (!this.localStream) {
      return;
    }

    this.localStream.getAudioTracks().forEach((track: any) => {
      track.enabled = !track.enabled;
    });
  }

  async switchSpeaker(enabled: boolean) {
    if (!this.localStream) {
      return;
    }

    this.localStream.getAudioTracks().forEach((track: any) => {
      if (track._switchSpeaker) {
        track._switchSpeaker(enabled);
      }
    });
  }

  endCall() {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track: any) => {
        track.stop();
      });
    }

    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach((track: any) => {
        track.stop();
      });
    }

    this.peer?.close();

    this.peer = null;
    this.localStream = null;
    this.remoteStream = null;
  }
}

export const webRtcService = new WebRTCService();
