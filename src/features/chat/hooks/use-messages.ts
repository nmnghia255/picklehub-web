"use client"

import { useInfiniteQuery } from "@tanstack/react-query"

import { chatClient } from "../api/chat-client"
import { chatQueryKeys } from "../api/chat-keys"

export function useMessages(
  conversationId: string | null,
  search: string,
  limit = 30
) {
  const normalizedSearch = search.trim()

  return useInfiniteQuery({
    queryKey: conversationId
      ? chatQueryKeys.messages(conversationId, normalizedSearch)
      : chatQueryKeys.messages("", normalizedSearch),
    queryFn: async ({ pageParam }) => {
      if (!conversationId) {
        throw new Error("Missing conversation id")
      }

      const params: { before?: string; limit: number; search?: string } = {
        limit,
      }

      if (normalizedSearch) {
        params.search = normalizedSearch
      } else if (typeof pageParam === "string" && pageParam) {
        params.before = pageParam
      }

      return chatClient.listMessages(conversationId, params)
    },
    enabled: Boolean(conversationId),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage, allPages) => {
      if (normalizedSearch) return undefined
      if (!lastPage.meta.nextBefore) return undefined
      if (
        allPages.some(
          (page) => page.meta.nextBefore === lastPage.meta.nextBefore
        )
      ) {
        return undefined
      }
      return lastPage.meta.nextBefore
    },
  })
}
