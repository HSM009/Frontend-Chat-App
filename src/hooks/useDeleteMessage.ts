import { useMutation, useQueryClient } from "@tanstack/react-query";

import { removeMessage } from "@/src/services/messageService";

export function useDeleteMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => removeMessage(messageId),

    onMutate: async (messageId) => {
      await queryClient.cancelQueries({
        queryKey: ["messages"],
      });

      const previousQueries = queryClient.getQueriesData({
        queryKey: ["messages"],
      });

      previousQueries.forEach(([queryKey, data]: any) => {
        if (!data) return;

        queryClient.setQueryData(queryKey, {
          ...data,
          messages: data.messages.map((m: any) =>
            m.id === messageId
              ? {
                  ...m,
                  isDeleted: true,
                  deletedAt: new Date().toISOString(),
                  text: null,
                  fileUrl: null,
                }
              : m,
          ),
        });
      });

      return {
        previousQueries,
      };
    },

    onError: (_err, _messageId, context) => {
      context?.previousQueries?.forEach(([queryKey, data]: any) => {
        queryClient.setQueryData(queryKey, data);
      });
    },

    // We'll rely on WebSocket instead of invalidating.
  });
}
