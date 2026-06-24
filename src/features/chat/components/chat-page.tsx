"use client"

import { useState } from "react"

import { mockConversations } from "../mock-data/conversations"
import type { Conversation } from "../types"
import { ChatArea } from "./chat-area"
import { ConversationList } from "./conversation-list"

const CURRENT_USER_ID = "user-1"

export function ChatPage() {
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null)

  const conversations = mockConversations

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      <div className="w-80 shrink-0 border-r bg-card">
        <ConversationList
          conversations={conversations}
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
            <div className="text-center">
              <p className="text-lg font-medium text-muted-foreground">
                Chọn một hội thoại để bắt đầu
              </p>
              <p className="mt-1 text-sm text-muted-foreground/70">
                Nhắn tin với bạn bè, nhóm và các buổi chơi
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
