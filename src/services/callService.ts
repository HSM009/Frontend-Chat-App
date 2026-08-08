import {
  AcceptCallRequest,
  CreateCallResponse,
  RejectCallRequest,
} from "../api/call";
import { api } from "../api/client";

export async function createCall(
  conversationId: string,
  receiverId: string,
): Promise<CreateCallResponse> {
  const { data } = await api.post("/calls", {
    conversationId,
    receiverId,
  });

  return data;
}

export async function acceptCall({ callId }: AcceptCallRequest) {
  const { data } = await api.post(`/calls/${callId}/accept`);

  return data;
}

export async function rejectCall({ callId }: RejectCallRequest) {
  const { data } = await api.post(`/calls/${callId}/reject`);

  return data;
}

export async function endCall(callId: string) {
  const { data } = await api.post(`/calls/${callId}/end`);

  return data;
}
