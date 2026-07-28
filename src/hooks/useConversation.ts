import { useMutation, useQuery } from "@tanstack/react-query";

import {
  fetchConversations,
  startConversation,
} from "@/src/services/conversationService";

export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
  });
}

export function useCreateConversation() {
  return useMutation({
    mutationFn: startConversation,
  });
}
