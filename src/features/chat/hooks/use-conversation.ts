"use client"

import { useQuery } from "@tanstack/react-query"

import { chatClient } from "../api/chat-client"
import { chatQueryKeys } from "../api/chat-keys"

export function useConversation(conversationId: string | null) {
  return useQuery({
    queryKey: conversationId
      ? chatQueryKeys.conversation(conversationId)
      : chatQueryKeys.conversation(""),
    queryFn: () => {
      if (!conversationId) {
        throw new Error("Missing conversation id")
      }
      return chatClient.getConversation(conversationId)
    },
    enabled: Boolean(conversationId),
  })
}
