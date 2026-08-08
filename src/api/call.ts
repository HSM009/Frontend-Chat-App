export type Call = {
  id: string;
  conversationId: string;

  callerId: string;
  receiverId: string;

  status: "RINGING" | "ACCEPTED" | "REJECTED" | "ENDED";

  createdAt: string;
};

export type IncomingCallPayload = {
  callId: string;
  conversationId: string;

  caller: {
    id: string;
    name: string;
    avatar: string | null;
  };
};

export type CreateCallResponse = {
  call: Call;

  receiver: {
    id: string;
    name: string;
    avatar: string | null;
  };
};

export type AcceptCallRequest = {
  callId: string;
};

export type RejectCallRequest = {
  callId: string;
};
