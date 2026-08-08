import { reactToMessage } from "@/src/api/reaction";

export async function sendReaction(messageId: string, emoji: string) {
  return reactToMessage(messageId, {
    emoji,
  });
}
