"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

import type { Conversation } from "../types"

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return "?"
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase()
}

function formatTime(dateStr: string | null) {
  if (!dateStr) return ""
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Vừa xong"
  if (diffMins < 60) return `${diffMins} phút trước`
  if (diffHours < 24) return `${diffHours} giờ trước`
  if (diffDays === 1) return "Hôm qua"
  if (diffDays < 7) return `${diffDays} ngày trước`
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  })
}

function getSourceLabel(conversation: Conversation): string | null {
  if (conversation.type === "social" && conversation.sourceInfo) {
    return `Social: ${conversation.sourceInfo.name}`
  }
  if (conversation.type === "group" && conversation.sourceInfo) {
    return `Từ nhóm: ${conversation.sourceInfo.name}`
  }
  if (conversation.type === "group") {
    return "Nhóm"
  }
  return null
}

interface ConversationItemProps {
  conversation: Conversation
  isActive: boolean
  onClick: () => void
}

export function ConversationItem({
  conversation,
  isActive,
  onClick,
}: ConversationItemProps) {
  const sourceLabel = getSourceLabel(conversation)

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50",
        isActive && "bg-accent"
      )}
    >
      <Avatar className="mt-0.5 h-10 w-10 shrink-0">
        <AvatarFallback className="text-xs font-semibold">
          {getInitials(conversation.name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-sm font-medium">
            {conversation.name}
          </span>
          <span className="shrink-0 text-[11px] text-muted-foreground">
            {formatTime(conversation.lastMessageAt)}
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {conversation.lastMessage}
        </p>
        {sourceLabel && (
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground/70">
            {sourceLabel}
          </p>
        )}
      </div>
      {conversation.unreadCount > 0 && (
        <span className="mt-1 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-medium text-primary-foreground">
          {conversation.unreadCount}
        </span>
      )}
    </button>
  )
}
