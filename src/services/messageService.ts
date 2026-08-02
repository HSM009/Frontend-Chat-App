import {
  getMessages,
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
