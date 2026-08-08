import {
  getMessages,
  markMessageAsDelivered,
  markMessageAsRead,
  Message,
  MessageType,
  sendMessage,
} from "@/src/api/message";

export async function fetchMessages(conversationId: string) {
  return getMessages(conversationId);
}

export async function createMessage(
  conversationId: string,
  text: string,
  type: MessageType,
  replyToId?: string | null,
): Promise<Message> {
  return await sendMessage(conversationId, {
    text,
    type,
    ...(replyToId && { replyToId }),
  });
}

export async function readMessage(messageId: string) {
  return markMessageAsRead(messageId);
}

export async function deliverMessage(messageId: string) {
  return markMessageAsDelivered(messageId);
}

import { deleteMessage } from "@/src/api/message";

export async function removeMessage(messageId: string) {
  return deleteMessage(messageId);
}

import { updateMessage as updateMessageApi } from "@/src/api/message";

export async function editMessage(messageId: string, text: string) {
  return updateMessageApi(messageId, {
    text,
  });
}
