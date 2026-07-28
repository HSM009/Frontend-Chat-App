import { api } from "./client";
import { Conversation } from "@/src/types/conversation";

export async function getConversations() {
  const response = await api.get<Conversation[]>("/conversations");

  return response.data;
}

export interface CreateConversationRequest {
  userId: string;
}

export interface ConversationResponse {
  id: string;
}

export async function createConversation(data: CreateConversationRequest) {
  const response = await api.post<ConversationResponse>("/conversations", data);

  return response.data;
}
