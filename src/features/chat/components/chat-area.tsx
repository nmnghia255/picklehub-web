"use client"

import { ImagePlus, Send, Smile } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { mockMessages } from "../mock-data/messages"
import type { ChatMessage, Conversation } from "../types"
import { MessageBubble } from "./message-bubble"

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return "?"
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase()
}

const quickEmojis = ["👍", "🔥", "😂", "❤️", "🎾"]

interface ChatAreaProps {
  conversation: Conversation
  currentUserId: string
}

export function ChatArea({ conversation, currentUserId }: ChatAreaProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(
    () => mockMessages[conversation.id] ?? []
  )
  const [text, setText] = useState("")
  const counterRef = useRef(0)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const createdObjectUrlsRef = useRef<string[]>([])
  const scrollerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    scrollerRef.current?.scrollTo({
      top: scrollerRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [messages])

  useEffect(() => {
    const createdUrls = createdObjectUrlsRef.current
    return () => {
      createdUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  const otherParticipants = conversation.participants.filter(
    (p) => p.id !== currentUserId
  )

  const pushMockIncomingReply = () => {
    if (otherParticipants.length === 0) return

    window.setTimeout(() => {
      const now = Date.now()
      const randomIndex = Math.floor(Math.random() * otherParticipants.length)
      const randomParticipant = otherParticipants[randomIndex]
      const replies = [
        "Ok, mình đồng ý!",
        "Tuyệt vời, hẹn gặp mọi người!",
        "Mình sẽ sắp xếp thời gian.",
        "Cảm ơn bạn đã nhắn tin!",
      ]
      const replyIndex = Math.floor(Math.random() * replies.length)
      const nextText = replies[replyIndex]

      const incoming: ChatMessage = {
        id: `cm-in-${now}`,
        conversationId: conversation.id,
        authorId: randomParticipant.id,
        authorName: randomParticipant.name,
        authorAvatar: randomParticipant.avatarUrl,
        kind: "text",
        text: nextText,
        imageUrl: null,
        createdAt: new Date(now).toISOString(),
      }
      setMessages((current) => [...current, incoming])
    }, 1200)
  }

  const handleSendText = () => {
    const trimmed = text.trim()
    if (!trimmed) return

    counterRef.current += 1
    const id = counterRef.current

    const newMessage: ChatMessage = {
      id: `cm-${id}`,
      conversationId: conversation.id,
      authorId: currentUserId,
      authorName: "Bạn",
      authorAvatar: null,
      kind: "text",
      text: trimmed,
      imageUrl: null,
      createdAt: new Date().toISOString(),
    }

    setMessages((current) => [...current, newMessage])
    setText("")
    pushMockIncomingReply()
  }

  const handleAddEmoji = (emoji: string) => {
    setText((current) => `${current}${emoji}`)
  }

  const handleChooseImage = () => {
    fileInputRef.current?.click()
  }

  const handleImageSelected: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    const imageUrl = URL.createObjectURL(file)
    createdObjectUrlsRef.current.push(imageUrl)

    counterRef.current += 1
    const id = counterRef.current

    const newMessage: ChatMessage = {
      id: `cm-img-${id}`,
      conversationId: conversation.id,
      authorId: currentUserId,
      authorName: "Bạn",
      authorAvatar: null,
      kind: "image",
      text: file.name,
      imageUrl,
      createdAt: new Date().toISOString(),
    }

    setMessages((current) => [...current, newMessage])
    event.target.value = ""
    pushMockIncomingReply()
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b px-5 py-3">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="text-xs font-semibold">
            {getInitials(conversation.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{conversation.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {conversation.type === "group"
              ? `${conversation.participants.length} thành viên`
              : conversation.type === "social"
                ? `Social: ${conversation.sourceInfo?.name ?? conversation.name}`
                : otherParticipants.map((p) => p.name).join(", ")}
          </p>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex-1 space-y-3 overflow-y-auto px-5 py-4"
      >
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwn={msg.authorId === currentUserId}
          />
        ))}
      </div>

      <div className="border-t bg-background px-5 py-3">
        <div className="mb-2 flex items-center gap-2 overflow-x-auto">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleChooseImage}
            title="Gửi ảnh"
          >
            <ImagePlus className="size-4" />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelected}
          />
          {quickEmojis.map((emoji) => (
            <Button
              key={emoji}
              type="button"
              variant="outline"
              size="sm"
              className="h-8 min-w-8 px-2"
              onClick={() => handleAddEmoji(emoji)}
            >
              {emoji}
            </Button>
          ))}
          <Button type="button" variant="ghost" size="icon" title="Emoji">
            <Smile className="size-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Nhập tin nhắn..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendText()
            }}
          />
          <Button onClick={handleSendText}>
            <Send className="mr-2 size-4" />
            Gửi
          </Button>
        </div>
      </div>
    </div>
  )
}
