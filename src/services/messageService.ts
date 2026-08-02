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
): Promise<Message> {
  return await sendMessage(conversationId, {
    text,
    type,
  });
}

export async function readMessage(messageId: string) {
  return markMessageAsRead(messageId);
}
