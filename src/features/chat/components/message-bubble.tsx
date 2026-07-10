"use client"

import { useTranslation } from "react-i18next"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

import type { ChatMessage } from "../types"

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return "?"
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase()
}

function formatTime(dateStr: string, locale: string) {
  const date = new Date(dateStr)
  return date.toLocaleTimeString(locale === "vi" ? "vi-VN" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

interface MessageBubbleProps {
  message: ChatMessage
  isOwn: boolean
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const { i18n } = useTranslation("common")
  const locale = i18n.resolvedLanguage?.startsWith("vi") ? "vi" : "en"

  return (
    <div className={cn("flex gap-2", isOwn ? "flex-row-reverse" : "flex-row")}>
      {!isOwn && (
        <Avatar className="mt-1 h-8 w-8 shrink-0">
          <AvatarFallback className="text-[10px] font-semibold">
            {getInitials(message.authorName)}
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-3 py-2 text-sm",
          isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        {!isOwn && (
          <p className="mb-0.5 text-[11px] font-medium text-muted-foreground">
            {message.authorName}
          </p>
        )}
        {message.kind === "image" && message.imageUrl ? (
          <div className="overflow-hidden rounded-md border">
            <img
              src={message.imageUrl}
              alt={message.text}
              className="max-h-56 w-full object-cover"
            />
          </div>
        ) : (
          <p className="break-words whitespace-pre-wrap">{message.text}</p>
        )}
        <p
          className={cn(
            "mt-0.5 text-[11px]",
            isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
          )}
        >
          {formatTime(message.createdAt, locale)}
        </p>
      </div>
    </div>
  )
}
