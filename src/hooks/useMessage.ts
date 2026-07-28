import { useQuery } from "@tanstack/react-query";
import { fetchMessages } from "@/src/services/messageService";

export function useMessages(conversationId: string) {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => fetchMessages(conversationId),
    enabled: !!conversationId,
  });
}
