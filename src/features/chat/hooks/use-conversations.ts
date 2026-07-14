"use client"

import { useInfiniteQuery } from "@tanstack/react-query"

import { chatClient } from "../api/chat-client"
import { chatQueryKeys } from "../api/chat-keys"

export function useConversations(limit = 20, enabled = true) {
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
