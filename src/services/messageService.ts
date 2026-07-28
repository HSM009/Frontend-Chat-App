import { getMessages, sendMessage } from "@/src/api/message";

export async function fetchMessages(conversationId: string) {
  return getMessages(conversationId);
}

export async function createMessage(conversationId: string, text: string) {
  return sendMessage(conversationId, {
    text,
  });
}
