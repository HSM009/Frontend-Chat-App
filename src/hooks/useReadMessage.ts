import { useMutation, useQueryClient } from "@tanstack/react-query";

import { readMessage } from "@/src/services/messageService";

export function useReadMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => readMessage(messageId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
  });
}
