"use client"

import { Loader2, Search } from "lucide-react"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"

import type { Conversation } from "../types"
import { getConversationTitle } from "../utils/chat-cache"
import { ConversationItem } from "./conversation-item"

interface ConversationListProps {
  conversations: Conversation[]
  currentUserId: string | null
  activeConversationId: string | null
  search: string
  onSearchChange: (value: string) => void
  onSelect: (conversation: Conversation) => void
  isLoading: boolean
  isError: boolean
  errorMessage?: string
  hasNextPage: boolean
  isFetchingNextPage: boolean
  onLoadMore: () => void
  totalUnreadCount: number
  onRetry: () => void
}

export function ConversationList({
  conversations,
  currentUserId,
  activeConversationId,
  search,
  onSearchChange,
  onSelect,
  isLoading,
  isError,
  errorMessage,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  totalUnreadCount,
  onRetry,
}: ConversationListProps) {
  const { t } = useTranslation("common")
  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return conversations

    return conversations.filter((conversation) => {
      const title = getConversationTitle(conversation, currentUserId)
      const preview = conversation.lastMessage?.body ?? ""
      return (
        title.toLowerCase().includes(keyword) ||
        preview.toLowerCase().includes(keyword)
      )
    })
  }, [conversations, currentUserId, search])

  return (
    <div className="flex h-full flex-col bg-card">
      <div className="border-b px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold">{t("chat.list.title")}</h2>
            <p className="text-xs text-muted-foreground">
              {t("chat.list.subtitle", {
                count: totalUnreadCount,
              })}
            </p>
          </div>
          <Badge variant="secondary" className="shrink-0">
            {t("chat.labels.unreadBadge", { count: totalUnreadCount })}
          </Badge>
        </div>

        <div className="relative mt-3">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t("chat.conversationList.searchPlaceholder")}
            className="pl-9"
            aria-label={t("chat.conversationList.searchPlaceholder")}
          />
        </div>
      </div>

      {isError ? (
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="max-w-sm text-center">
            <p className="text-sm font-medium">{t("chat.states.errorTitle")}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {errorMessage || t("chat.states.errorDescription")}
            </p>
            <Button variant="outline" className="mt-4" onClick={onRetry}>
              {t("chat.states.retry")}
            </Button>
          </div>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="min-h-full">
            {isLoading ? (
              <div className="space-y-3 p-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Skeleton className="size-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex min-h-[240px] items-center justify-center p-6 text-center">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {t("chat.conversationList.emptyState")}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("chat.conversationList.emptyHint")}
                  </p>
                </div>
              </div>
            ) : (
              <div>
                {filtered.map((conversation) => (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    currentUserId={currentUserId}
                    isActive={conversation.id === activeConversationId}
                    onClick={() => onSelect(conversation)}
                  />
                ))}

                {hasNextPage && (
                  <div className="border-t p-4">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={onLoadMore}
                      disabled={isFetchingNextPage}
                    >
                      {isFetchingNextPage ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                      ) : null}
                      {t("chat.conversationList.loadMore")}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
