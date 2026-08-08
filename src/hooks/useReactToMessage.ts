import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "@/src/store/authStore";
import { reactToMessage } from "@/src/api/reaction";

export function useReactToMessage() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: string; emoji: string }) =>
      reactToMessage(messageId, {
        emoji,
      }),

    onMutate: async ({ messageId, emoji }) => {
      if (!currentUser) return;

      // Stop incoming refetches
      await queryClient.cancelQueries({
        queryKey: ["messages"],
      });

      // Save current cache
      const previousQueries = queryClient.getQueriesData({
        queryKey: ["messages"],
      });

      // Optimistic update
      previousQueries.forEach(([queryKey, data]: any) => {
        if (!data) return;

        queryClient.setQueryData(queryKey, {
          ...data,
          messages: data.messages.map((m: any) => {
            if (m.id !== messageId) return m;

            const existingReaction = (m.reactions ?? []).find(
              (r: any) => r.userId === currentUser.id,
            );

            let reactions = [...(m.reactions ?? [])];

            if (existingReaction?.emoji === emoji) {
              // Toggle OFF
              reactions = reactions.filter(
                (r: any) => r.userId !== currentUser.id,
              );
            } else {
              // Replace previous reaction
              reactions = reactions.filter(
                (r: any) => r.userId !== currentUser.id,
              );

              reactions.push({
                userId: currentUser.id,
                emoji,
                user: {
                  id: currentUser.id,
                  name: currentUser.name,
                },
              });
            }

            return {
              ...m,
              reactions,
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

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["messages"],
      });
    },
  });
}
