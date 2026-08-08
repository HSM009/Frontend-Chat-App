import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  Message,
  MessageDeletedPayload,
  MessageDeliveredPayload,
  MessageNewPayload,
  MessageReactionPayload,
  MessageReadPayload,
  MessageUpdatedPayload,
} from "../api/message";

import { socketService } from "../services/socket";
import { WebSocketEvents } from "../types/webSocketEvent";
import { useReadMessage } from "./useReadMessage";
import { IncomingCallPayload } from "../api/call";
import { useCallStore } from "../store/callStore";
import { router } from "expo-router";

type Props = {
  conversationId: string;
  currentUserId: string;
  userId: string;
};

export function useConversationSocket({
  conversationId,
  currentUserId,
  userId,
}: Props) {
  const queryClient = useQueryClient();
  const readMutation = useReadMessage();
  const {
    startIncomingCall,
    clearOutgoingCall,
    setCallAccepted,
    outgoingCall,
    incomingCall,
    callAccepted,
    clearIncomingCall,
    clearCallAccepted,
  } = useCallStore();
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  useEffect(() => {
    if (!callAccepted) {
      return;
    }

    clearOutgoingCall();

    router.push({
      pathname: "/call/[callId]",
      params: {
        callId: callAccepted,
      },
    });

    clearCallAccepted();
  }, [callAccepted, clearOutgoingCall, clearCallAccepted]);

  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleOnline(payload: { userId: string }) {
    if (payload.userId !== userId) return;

    setIsOnline(true);
  }

  function handleOffline(payload: { userId: string }) {
    if (payload.userId !== userId) return;

    setIsOnline(false);
  }

  function handleTyping(payload: {
    conversationId: string;
    userId: string;
    typing: boolean;
  }) {
    if (
      payload.conversationId !== conversationId ||
      payload.userId !== userId
    ) {
      return;
    }

    if (!payload.typing) {
      setIsTyping(false);

      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }

      return;
    }

    setIsTyping(true);

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    typingTimeout.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  }

  function handleMessage(payload: MessageNewPayload) {
    if (payload.conversationId !== conversationId) return;

    queryClient.setQueryData(["messages", conversationId], (old: any) => {
      if (!old) return old;

      const exists = old.messages.some(
        (m: Message) => m.id === payload.message.id,
      );

      if (exists) return old;

      return {
        ...old,
        messages: [payload.message, ...old.messages],
      };
    });

    if (
      payload.message.senderId !== currentUserId &&
      payload.message.reads.length === 0
    ) {
      readMutation.mutate(payload.message.id);
    }
  }

  function handleReadReceipt(payload: MessageReadPayload) {
    queryClient.setQueryData(["messages", conversationId], (old: any) => {
      if (!old) return old;

      return {
        ...old,
        messages: old.messages.map((m: Message) =>
          m.id === payload.messageId
            ? {
                ...m,
                reads: [
                  ...m.reads,
                  {
                    userId: payload.userId,
                    readAt: payload.readAt,
                  },
                ],
              }
            : m,
        ),
      };
    });
  }

  function handleDelivered(payload: MessageDeliveredPayload) {
    queryClient.setQueryData(["messages", conversationId], (old: any) => {
      if (!old) return old;

      return {
        ...old,
        messages: old.messages.map((m: any) => {
          if (m.id !== payload.messageId) return m;

          const exists =
            m.deliveries?.some((d: any) => d.userId === payload.userId) ??
            false;

          if (exists) return m;

          return {
            ...m,
            deliveries: [
              ...(m.deliveries ?? []),
              {
                userId: payload.userId,
                deliveredAt: new Date().toISOString(),
              },
            ],
          };
        }),
      };
    });
  }

  function handleReaction(payload: MessageReactionPayload) {
    queryClient.setQueryData(["messages", conversationId], (old: any) => {
      if (!old) return old;

      return {
        ...old,
        messages: old.messages.map((m: any) => {
          if (m.id !== payload.messageId) return m;

          let reactions = [...(m.reactions ?? [])];

          if (payload.removed) {
            reactions = reactions.filter(
              (r: any) => r.userId !== payload.userId,
            );
          } else {
            const index = reactions.findIndex(
              (r: any) => r.userId === payload.userId,
            );

            if (index >= 0) {
              reactions[index] = {
                ...reactions[index],
                emoji: payload.emoji,
              };
            } else {
              reactions.push({
                userId: payload.userId,
                emoji: payload.emoji,
              });
            }
          }

          return {
            ...m,
            reactions,
          };
        }),
      };
    });
  }

  function handleDeleted(payload: MessageDeletedPayload) {
    queryClient.setQueryData(["messages", conversationId], (old: any) => {
      if (!old) return old;

      return {
        ...old,
        messages: old.messages.map((m: any) =>
          m.id === payload.messageId
            ? {
                ...m,
                isDeleted: true,
                deletedAt: payload.deletedAt,
                text: null,
                fileUrl: null,
                fileName: null,
                mimeType: null,
                fileSize: null,
              }
            : m,
        ),
      };
    });
  }

  function handleUpdated(payload: MessageUpdatedPayload) {
    queryClient.setQueryData(["messages", conversationId], (old: any) => {
      if (!old) return old;

      return {
        ...old,
        messages: old.messages.map((m: any) =>
          m.id === payload.id
            ? {
                ...m,
                text: payload.text,
                editedAt: payload.editedAt,
              }
            : m,
        ),
      };
    });
  }

  function handleAccepted(payload: { callId: string }) {
    const store = useCallStore.getState();

    if (outgoingCall?.call.id !== payload.callId) {
      return;
    }

    setCallAccepted(payload.callId);
  }

  function handleRejected(payload: { callId: string }) {
    const store = useCallStore.getState();

    if (outgoingCall?.call.id !== payload.callId) {
      return;
    }

    clearOutgoingCall();
  }

  function handleIncomingCall(payload: IncomingCallPayload) {
    startIncomingCall(payload);
  }

  useEffect(() => {
    socketService.subscribe(WebSocketEvents.USER_ONLINE, handleOnline);
    socketService.subscribe(WebSocketEvents.USER_OFFLINE, handleOffline);
    socketService.subscribe(WebSocketEvents.USER_TYPING, handleTyping);
    socketService.subscribe(WebSocketEvents.MESSAGE_NEW, handleMessage);
    socketService.subscribe(WebSocketEvents.READ_RECEIPT, handleReadReceipt);
    socketService.subscribe(WebSocketEvents.MESSAGE_DELIVERED, handleDelivered);
    socketService.subscribe(WebSocketEvents.MESSAGE_REACTION, handleReaction);
    socketService.subscribe(WebSocketEvents.MESSAGE_DELETED, handleDeleted);
    socketService.subscribe(WebSocketEvents.MESSAGE_UPDATED, handleUpdated);
    socketService.subscribe(WebSocketEvents.CALL_ACCEPT, handleAccepted);
    socketService.subscribe(WebSocketEvents.CALL_REJECT, handleRejected);
    socketService.subscribe(WebSocketEvents.CALL_INVITE, handleIncomingCall);
    return () => {
      socketService.unsubscribe(WebSocketEvents.USER_ONLINE, handleOnline);
      socketService.unsubscribe(WebSocketEvents.USER_OFFLINE, handleOffline);
      socketService.unsubscribe(WebSocketEvents.USER_TYPING, handleTyping);
      socketService.unsubscribe(WebSocketEvents.MESSAGE_NEW, handleMessage);
      socketService.unsubscribe(
        WebSocketEvents.READ_RECEIPT,
        handleReadReceipt,
      );
      socketService.unsubscribe(
        WebSocketEvents.MESSAGE_DELIVERED,
        handleDelivered,
      );
      socketService.unsubscribe(
        WebSocketEvents.MESSAGE_REACTION,
        handleReaction,
      );
      socketService.unsubscribe(WebSocketEvents.MESSAGE_DELETED, handleDeleted);
      socketService.unsubscribe(WebSocketEvents.MESSAGE_UPDATED, handleUpdated);
      socketService.unsubscribe(WebSocketEvents.CALL_ACCEPT, handleAccepted);
      socketService.unsubscribe(WebSocketEvents.CALL_REJECT, handleRejected);
      socketService.unsubscribe(
        WebSocketEvents.CALL_INVITE,
        handleIncomingCall,
      );

      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
    };
  }, [conversationId, currentUserId, userId]);

  return {
    isTyping,
    isOnline,
  };
}
