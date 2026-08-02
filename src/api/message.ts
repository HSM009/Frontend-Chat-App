import { api } from "./client";

export interface MessageNewPayload {
  conversationId: string;
  message: Message;
  lastMessageAt: string;
}
export interface Message {
  id: string;
  conversationId: string;

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
    deletedAt: string | null;
    sender: {
      id: string;
      name: string;
    };
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

export enum MessageType {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
  AUDIO = "AUDIO",
  FILE = "FILE",
}
export interface SendMessageRequest {
  text: string;
  type: MessageType;
  replyToId?: string | null;
}

export async function sendMessage(
  conversationId: string,
  data: SendMessageRequest,
) {
  const response = await api.post(`/messages/${conversationId}/messages`, data);

  console.log("SEND RESPONSE:", response.data);

  return response.data;
}

export interface MessageReadPayload {
  conversationId: string;
  messageId: string;
  userId: string;
  readAt: string;
}
export async function markMessageAsRead(messageId: string) {
  return api.post(`/messages/${messageId}/read`);
}
