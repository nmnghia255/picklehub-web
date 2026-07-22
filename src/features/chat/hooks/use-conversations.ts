"use client"

import { useInfiniteQuery } from "@tanstack/react-query"

import { chatClient, DEFAULT_CONVERSATION_PAGE_SIZE } from "../api/chat-client"
import { chatQueryKeys } from "../api/chat-keys"

export function useConversations(
  limit = DEFAULT_CONVERSATION_PAGE_SIZE,
  enabled = true
) {
  return useInfiniteQuery({
    queryKey: chatQueryKeys.conversations(),
    queryFn: async ({ pageParam = 1 }) =>
      chatClient.listConversations({ page: pageParam, limit }),
    enabled,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.meta
      if (page >= totalPages) return undefined
      return page + 1
    },
    initialPageParam: 1,
  })
}
