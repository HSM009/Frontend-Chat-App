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
  editedAt: string | null;
  deletedAt: string | null;
  type: string;
  optimistic?: boolean;
  sender: {
    id: string;
    name: string;
  };
  reads: {
    userId: string;
    readAt: string;
  }[];
  reactions: {
    userId: string;
    emoji: string;
    user?: {
      id: string;
      name: string;
    };
  }[];
  deliveries: {
    userId: string;
    deliveredAt: string;
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

export async function markMessageAsDelivered(messageId: string) {
  return api.post(`/messages/${messageId}/delivered`);
}

export interface MessageDeliveredPayload {
  messageId: string;
  userId: string;
}

export interface MessageReactionPayload {
  messageId: string;
  userId: string;
  emoji: string;
  removed: boolean;
}

export interface MessageDeletedPayload {
  conversationId: string;
  messageId: string;
  deletedAt: string;
  deletedBy: string;
}

export async function deleteMessage(messageId: string) {
  const response = await api.delete(`/messages/${messageId}`);

  return response.data;
}

export interface UpdateMessageRequest {
  text: string;
}

export interface UpdateMessageRequest {
  text: string;
}

export async function updateMessage(
  messageId: string,
  data: UpdateMessageRequest,
) {
  const response = await api.patch(`/messages/${messageId}`, data);

  return response.data;
}

export interface MessageUpdatedPayload extends Message {}
