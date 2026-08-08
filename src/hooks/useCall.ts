import { useMutation } from "@tanstack/react-query";

import {
  createCall,
  acceptCall,
  rejectCall,
  endCall,
} from "../services/callService";

export function useCreateCall() {
  return useMutation({
    mutationFn: ({
      conversationId,
      receiverId,
    }: {
      conversationId: string;
      receiverId: string;
    }) => createCall(conversationId, receiverId),
  });
}

export function useAcceptCall() {
  return useMutation({
    mutationFn: acceptCall,
  });
}

export function useRejectCall() {
  return useMutation({
    mutationFn: rejectCall,
  });
}

export function useEndCall() {
  return useMutation({
    mutationFn: endCall,
  });
}
