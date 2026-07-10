"use client"

import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { mockConversations } from "../mock-data/conversations"
import type { Conversation } from "../types"
import { ChatArea } from "./chat-area"
import { ConversationList } from "./conversation-list"

const CURRENT_USER_ID = "user-1"

export function ChatPage() {
  const { t } = useTranslation("common")
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null)

  useEffect(() => {
    document.title = t("chat.pageTitle")

    const meta = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]'
    )
    if (meta) {
      meta.content = t("chat.pageDescription")
    }
  }, [t])

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      <div className="w-80 shrink-0 border-r bg-card">
        <ConversationList
          conversations={mockConversations}
          activeConversationId={activeConversation?.id ?? null}
          onSelect={setActiveConversation}
        />
      </div>

      <div className="flex flex-1 flex-col">
        {activeConversation ? (
          <ChatArea
            key={activeConversation.id}
            conversation={activeConversation}
            currentUserId={CURRENT_USER_ID}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="max-w-md text-center">
              <p className="text-lg font-medium text-muted-foreground">
                {t("chat.emptyState.title")}
              </p>
              <p className="mt-1 text-sm text-muted-foreground/70">
                {t("chat.emptyState.description")}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
