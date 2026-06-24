"use client"

import { Search } from "lucide-react"
import { useMemo, useState } from "react"

import { Input } from "@/components/ui/input"

import type { Conversation } from "../types"
import { ConversationItem } from "./conversation-item"

interface ConversationListProps {
  conversations: Conversation[]
  activeConversationId: string | null
  onSelect: (conversation: Conversation) => void
}

export function ConversationList({
  conversations,
  activeConversationId,
  onSelect,
}: ConversationListProps) {
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    if (!search.trim()) return conversations
    const keyword = search.trim().toLowerCase()
    return conversations.filter(
      (c) =>
        c.name.toLowerCase().includes(keyword) ||
        (c.lastMessage && c.lastMessage.toLowerCase().includes(keyword))
    )
  }, [conversations, search])

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-3">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm hội thoại..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            Không tìm thấy hội thoại.
          </p>
        ) : (
          filtered.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isActive={conversation.id === activeConversationId}
              onClick={() => onSelect(conversation)}
            />
          ))
        )}
      </div>
    </div>
  )
}
