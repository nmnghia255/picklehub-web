"use client"

import { ImagePlus, Send, Smile } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

import {
  type ChatMessage,
  mockGroupChatMessages,
} from "../mock-data/chat-messages"

interface GroupChatProps {
  groupId: string
  fullPage?: boolean
}

const quickEmojis = ["👍", "🔥", "😂", "❤️", "🎾"]

function formatNowLabel() {
  return new Date().toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function GroupChat({ groupId, fullPage = false }: GroupChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(mockGroupChatMessages)
  const [text, setText] = useState("")
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

  const wrapperClass = useMemo(
    () => (fullPage ? "h-full rounded-none border-0 shadow-none" : "border"),
    [fullPage]
  )

  const contentClass = useMemo(
    () => (fullPage ? "flex h-full flex-col gap-4 p-0" : "flex flex-col gap-4"),
    [fullPage]
  )

  const pushMockIncomingReply = (seed: "text" | "image") => {
    const nextText =
      seed === "image"
        ? "Ảnh đẹp đó, chốt lịch luôn nhé!"
        : "Ok, mình thấy rồi. Hẹn mọi người trên sân nhé!"

    window.setTimeout(() => {
      const incoming: ChatMessage = {
        id: `m-in-${Date.now()}`,
        authorId: "user-2",
        authorName: "Nguyễn An",
        kind: "text",
        text: nextText,
        timeLabel: formatNowLabel(),
      }
      setMessages((current) => [...current, incoming])
    }, 1200)
  }

  const handleSendText = () => {
    const trimmed = text.trim()
    if (!trimmed) return

    const newMessage: ChatMessage = {
      id: `m-${Date.now()}`,
      authorId: "user-1",
      authorName: "Bạn",
      kind: "text",
      text: trimmed,
      timeLabel: formatNowLabel(),
    }

    setMessages((current) => [...current, newMessage])
    setText("")
    pushMockIncomingReply("text")
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

    const newMessage: ChatMessage = {
      id: `m-img-${Date.now()}`,
      authorId: "user-1",
      authorName: "Bạn",
      kind: "image",
      imageUrl,
      text: file.name,
      timeLabel: formatNowLabel(),
    }

    setMessages((current) => [...current, newMessage])
    event.target.value = ""
    pushMockIncomingReply("image")
  }

  return (
    <Card className={wrapperClass}>
      <CardContent className={contentClass}>
        <div
          ref={scrollerRef}
          className="flex-1 space-y-3 overflow-auto px-4 py-4 sm:px-6"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.authorId === "user-1" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                  msg.authorId === "user-1"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <div className="text-xs font-medium">{msg.authorName}</div>
                {msg.kind === "image" && msg.imageUrl ? (
                  <div className="mt-2 overflow-hidden rounded-md border">
                    <img
                      src={msg.imageUrl}
                      alt={msg.text ?? "image"}
                      className="max-h-72 w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="mt-1">{msg.text}</div>
                )}
                <div className="mt-1 text-[11px] text-muted-foreground">
                  {msg.timeLabel}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t bg-background px-4 py-3 sm:px-6">
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
              placeholder={`Nhắn trong nhóm ${groupId}...`}
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
      </CardContent>
    </Card>
  )
}
