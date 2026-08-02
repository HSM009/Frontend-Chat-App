import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createMessage } from "@/src/services/messageService";
import { MessageType } from "../api/message";
import { useAuthStore } from "@/src/store/authStore";

export function useSendMessage() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: ({
      conversationId,
      text,
      type,
    }: {
      conversationId: string;
      text: string;
      type: MessageType;
    }) => createMessage(conversationId, text, type),

    onMutate: async ({ conversationId, text, type }) => {
      if (!currentUser) {
        throw new Error("User not found");
      }

      // Stop outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["messages", conversationId],
      });

      await queryClient.cancelQueries({
        queryKey: ["conversations"],
      });

      // Save previous cache
      const previousMessages = queryClient.getQueryData([
        "messages",
        conversationId,
      ]);

      const previousConversations = queryClient.getQueryData(["conversations"]);

      // Fake temporary id
      const optimisticId = `temp-${Date.now()}`;

      const optimisticMessage = {
        id: optimisticId,
        text,
        type,
        senderId: currentUser.id,
        createdAt: new Date().toISOString(),

        sender: {
          id: currentUser.id,
          name: currentUser.name,
        },

        reads: [],
        replyTo: null,
        isDeleted: false,

        optimistic: true,
      };

      // -----------------------------
      // Update Messages Cache
      // -----------------------------
      queryClient.setQueryData(["messages", conversationId], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          messages: [optimisticMessage, ...old.messages],
        };
      });

      // -----------------------------
      // Update Conversation Cache
      // -----------------------------
      queryClient.setQueryData(["conversations"], (old: any) => {
        if (!old) return old;

        return old
          .map((conversation: any) => {
            if (conversation.id !== conversationId) {
              return conversation;
            }

            return {
              ...conversation,
              lastMessage: optimisticMessage,
              lastMessageAt: optimisticMessage.createdAt,
            };
          })
          .sort(
            (a: any, b: any) =>
              new Date(b.lastMessageAt).getTime() -
              new Date(a.lastMessageAt).getTime(),
          );
      });

      return {
        previousMessages,
        previousConversations,
        optimisticId,
      };
    },

    onSuccess: (message, variables, context) => {
      // -----------------------------
      // Replace optimistic message
      // -----------------------------
      queryClient.setQueryData(
        ["messages", variables.conversationId],
        (old: any) => {
          if (!old) return old;

          return {
            ...old,
            messages: old.messages.map((m: any) =>
              m.id === context?.optimisticId ? message : m,
            ),
          };
        },
      );

      // -----------------------------
      // Replace last message
      // -----------------------------
      queryClient.setQueryData(["conversations"], (old: any) => {
        if (!old) return old;

        return old
          .map((conversation: any) => {
            if (conversation.id !== variables.conversationId) {
              return conversation;
            }

            return {
              ...conversation,
              lastMessage: message,
              lastMessageAt: message.createdAt,
            };
          })
          .sort(
            (a: any, b: any) =>
              new Date(b.lastMessageAt).getTime() -
              new Date(a.lastMessageAt).getTime(),
          );
      });
    },

    onError: (_error, variables, context) => {
      // Restore previous cache
      queryClient.setQueryData(
        ["messages", variables.conversationId],
        context?.previousMessages,
      );

      queryClient.setQueryData(
        ["conversations"],
        context?.previousConversations,
      );
    },
  });
}
