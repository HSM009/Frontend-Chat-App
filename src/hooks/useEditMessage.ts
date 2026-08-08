import { useMutation, useQueryClient } from "@tanstack/react-query";

import { editMessage } from "@/src/services/messageService";

type EditMessageInput = {
  messageId: string;
  text: string;
};

export function useEditMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, text }: EditMessageInput) =>
      editMessage(messageId, text),

    onMutate: async ({ messageId, text }) => {
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
          messages: data.messages.map((message: any) => {
            if (message.id !== messageId) {
              return message;
            }

            return {
              ...message,
              text,
              editedAt: new Date().toISOString(),
            };
          }),
        });
      });

      return {
        previousQueries,
      };
    },

    onError: (_error, _variables, context) => {
      context?.previousQueries?.forEach(([queryKey, data]: any) => {
        queryClient.setQueryData(queryKey, data);
      });
    },

    onSuccess: (updatedMessage: any) => {
      const queries = queryClient.getQueriesData({
        queryKey: ["messages"],
      });

      queries.forEach(([queryKey, data]: any) => {
        if (!data) return;

        queryClient.setQueryData(queryKey, {
          ...data,
          messages: data.messages.map((message: any) =>
            message.id === updatedMessage.id ? updatedMessage : message,
          ),
        });
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["messages"],
      });
    },
  });
}
