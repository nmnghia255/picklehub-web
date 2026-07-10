"use client"

import { useTranslation } from "react-i18next"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

import type { Conversation } from "../types"

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return "?"
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase()
}

function formatTime(
  dateStr: string | null,
  t: (key: string, options?: Record<string, unknown>) => string,
  locale: string
) {
  if (!dateStr) return ""
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return t("chat.relativeTime.justNow")
  if (diffMins < 60) {
    return t("chat.relativeTime.minutesAgo", { count: diffMins })
  }
  if (diffHours < 24) {
    return t("chat.relativeTime.hoursAgo", { count: diffHours })
  }
  if (diffDays === 1) return t("chat.relativeTime.yesterday")
  if (diffDays < 7) {
    return t("chat.relativeTime.daysAgo", { count: diffDays })
  }
  return date.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {
    day: "2-digit",
    month: "2-digit",
  })
}

function getSourceLabel(
  conversation: Conversation,
  t: (key: string, options?: Record<string, unknown>) => string
): string | null {
  if (conversation.type === "social" && conversation.sourceInfo) {
    return t("chat.messages.socialPrefix", {
      name: conversation.sourceInfo.name,
    })
  }
  if (conversation.type === "group" && conversation.sourceInfo) {
    return t("chat.messages.fromGroup", {
      name: conversation.sourceInfo.name,
    })
  }
  if (conversation.type === "group") {
    return t("chat.messages.groupOnly")
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
  const { t, i18n } = useTranslation("common")
  const locale = i18n.resolvedLanguage?.startsWith("vi") ? "vi" : "en"
  const sourceLabel = getSourceLabel(conversation, t)

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
            {formatTime(conversation.lastMessageAt, t, locale)}
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
