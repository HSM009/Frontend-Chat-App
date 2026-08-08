import { api } from "./client";

export async function reactToMessage(
  messageId: string,
  data: {
    emoji: string;
  },
) {
  return api.post(`/messages/${messageId}/reactions`, data);
}
