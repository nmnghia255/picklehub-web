"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { useSession } from "@/features/auth/hooks/use-session"
import { useIsMobile } from "@/hooks/use-mobile"

import { chatQueryKeys } from "../api/chat-keys"
import { useConversations } from "../hooks/use-conversations"
import type { Conversation } from "../types"
import { dedupeById } from "../utils/chat-cache"
import { ChatArea } from "./chat-area"
import { ConversationList } from "./conversation-list"

function flattenConversations(pages?: Array<{ data: Conversation[] }>) {
  if (!pages) return []
  return dedupeById(pages.flatMap((page) => page.data ?? []))
}

export function ChatPage() {
  const { t } = useTranslation("common")
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedConversationId = searchParams.get("conversationId")
  const session = useSession()
  const queryClient = useQueryClient()
  const isMobile = useIsMobile()
  const [search, setSearch] = useState("")
  const conversationsQuery = useConversations(20, Boolean(session?.accessToken))

  const conversations = useMemo(
    () => flattenConversations(conversationsQuery.data?.pages),
    [conversationsQuery.data?.pages]
  )

  const totalUnreadCount = useMemo(
    () =>
      conversations.reduce(
        (sum, conversation) => sum + conversation.unreadCount,
        0
      ),
    [conversations]
  )

  const handleSelectConversation = (conversation: Conversation) => {
    router.push(`/chat?conversationId=${conversation.id}`)
  }

  const handleConversationHidden = () => {
    if (selectedConversationId) {
      queryClient.removeQueries({
        queryKey: chatQueryKeys.conversation(selectedConversationId),
      })
    }
    router.replace("/chat")
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] min-h-0 overflow-hidden bg-background">
      {(!isMobile || !selectedConversationId) && (
        <div className="flex min-h-0 w-full shrink-0 flex-col border-r md:w-[380px] xl:w-[420px]">
          <ConversationList
            conversations={conversations}
            currentUserId={session?.user?.id ?? null}
            activeConversationId={selectedConversationId}
            search={search}
            onSearchChange={setSearch}
            onSelect={handleSelectConversation}
            isLoading={conversationsQuery.isLoading}
            isError={conversationsQuery.isError && !conversationsQuery.data}
            errorMessage={t("chat.states.errorDescription")}
            hasNextPage={Boolean(conversationsQuery.hasNextPage)}
            isFetchingNextPage={conversationsQuery.isFetchingNextPage}
            onLoadMore={() => void conversationsQuery.fetchNextPage()}
            isFetchingNextPageError={conversationsQuery.isFetchNextPageError}
            onRetryNextPage={() => void conversationsQuery.fetchNextPage()}
            totalUnreadCount={totalUnreadCount}
            onRetry={() => void conversationsQuery.refetch()}
          />
        </div>
      )}

      {selectedConversationId ? (
        <div className="flex min-w-0 flex-1 flex-col">
          <ChatArea
            key={selectedConversationId}
            conversationId={selectedConversationId}
            currentUserId={session?.user?.id ?? null}
            onBack={() => router.replace("/chat")}
            onConversationHidden={handleConversationHidden}
          />
        </div>
      ) : (
        !isMobile && (
          <div className="flex flex-1 items-center justify-center p-6">
            <div className="max-w-md text-center">
              <p className="text-lg font-medium text-foreground">
                {t("chat.states.emptyTitle")}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("chat.states.emptyDescription")}
              </p>
            </div>
          </div>
        )
      )}
    </div>
  )
}
