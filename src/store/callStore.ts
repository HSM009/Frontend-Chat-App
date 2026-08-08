import { create } from "zustand";

import { Call, IncomingCallPayload } from "@/src/api/call";

type Receiver = {
  id: string;
  name: string;
  avatar: string | null;
};

type OutgoingCall = {
  call: Call;
  receiver: Receiver;
};

type CallStore = {
  incomingCall: IncomingCallPayload | null;

  outgoingCall: OutgoingCall | null;

  callAccepted: string | null;

  startIncomingCall: (call: IncomingCallPayload) => void;

  clearIncomingCall: () => void;

  startOutgoingCall: (call: Call, receiver: Receiver) => void;

  clearOutgoingCall: () => void;

  setCallAccepted: (callId: string) => void;

  clearCallAccepted: () => void;
};

export const useCallStore = create<CallStore>((set) => ({
  incomingCall: null,

  outgoingCall: null,

  callAccepted: null,

  startIncomingCall: (call) =>
    set({
      incomingCall: call,
    }),

  clearIncomingCall: () =>
    set({
      incomingCall: null,
    }),

  startOutgoingCall: (call, receiver) =>
    set({
      outgoingCall: {
        call,
        receiver,
      },
    }),

  clearOutgoingCall: () =>
    set({
      outgoingCall: null,
    }),

  setCallAccepted: (callId) =>
    set({
      callAccepted: callId,
    }),

  clearCallAccepted: () =>
    set({
      callAccepted: null,
    }),
}));
