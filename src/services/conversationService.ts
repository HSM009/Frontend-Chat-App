import { createConversation, getConversations } from "@/src/api/conversation";

export async function fetchConversations() {
  return await getConversations();
}
export async function startConversation(userId: string) {
  return await createConversation({
    userId,
  });
}
