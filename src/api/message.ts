import { api } from "./client";

export interface Message {
  id: string;
  text: string | null;
  senderId: string;
  createdAt: string;
  type: string;
  sender: {
    id: string;
    name: string;
  };
  reads: {
    userId: string;
    readAt: string;
  }[];
  replyTo: {
    id: string;
    text: string | null;
  } | null;
  isDeleted: boolean;
}

export interface GetMessagesResponse {
  messages: Message[];
  nextCursor: string | null;
  hasMore: boolean;
}

export async function getMessages(conversationId: string) {
  const response = await api.get<GetMessagesResponse>(
    `/messages/${conversationId}/messages`,
  );
  return response.data;
}

export interface SendMessageRequest {
  text: string;
}

export async function sendMessage(
  conversationId: string,
  data: SendMessageRequest,
) {
  const response = await api.post(`/messages/${conversationId}/messages`, data);
  return response.data;
}
