"use client"

import { Bot, Loader2, MessageCircle, Plus, Send, Sparkles } from "lucide-react"
import React, { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import ReactMarkdown from "react-markdown"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

// Generate unique ID outside the component to satisfy React Compiler purity check
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

export function ChatBot() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === "vi"

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [userInitials, setUserInitials] = useState("U")

  // Load user profile for initials and avatar
  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/proxy/users/me")
        if (response.ok) {
          const resJson = await response.json()
          const profile =
            resJson.success && resJson.data ? resJson.data : resJson
          if (profile.avatarUrl) {
            setAvatarUrl(profile.avatarUrl)
          }
          const fullName = profile.fullName || profile.name || ""
          if (fullName) {
            const initials = fullName
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()
            setUserInitials(initials)
          }
        }
      } catch (err) {
        console.error("Failed to load user profile for chat avatar:", err)
      }
    }
    loadProfile()
  }, [])

  // Use a ref to store the mutable accumulated text stream to satisfy React Compiler immutability rules
  const accumulatedReplyRef = useRef("")

  // Auto-scroll to bottom of the chat list when new chunks arrive or sheet opens
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isLoading, open])

  // Suggested starting questions
  const suggestions = isVi
    ? [
        {
          label: "Luật hai lần nảy (Double-Bounce)",
          prompt:
            "Giải thích luật hai lần nảy (Double-Bounce) trong Pickleball.",
        },
        {
          label: "Kitchen (Non-Volley Zone) là gì?",
          prompt: "Vùng Kitchen (Non-Volley Zone) là gì và quy định thế nào?",
        },
        {
          label: "Hướng dẫn chọn vợt Pickleball",
          prompt: "Làm thế nào để chọn vợt Pickleball phù hợp cho người mới?",
        },
        {
          label: "Kỹ thuật Dink hiệu quả",
          prompt: "Cho tôi một số lời khuyên và bài tập để cải thiện cú dink.",
        },
      ]
    : [
        {
          label: "Double-Bounce Rule",
          prompt: "Explain the double-bounce rule in Pickleball.",
        },
        {
          label: "What is the Kitchen?",
          prompt:
            "What is the Kitchen (Non-Volley Zone) and what are its rules?",
        },
        {
          label: "How to Choose a Paddle",
          prompt: "How do I choose the right Pickleball paddle for a beginner?",
        },
        {
          label: "Dinking Technique Tips",
          prompt: "Give me some tips and drills to improve my dinking.",
        },
      ]

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return

    setIsLoading(true)
    setError(null)

    const userMessageId = generateId()
    const assistantMessageId = generateId()

    const newUserMessage: Message = {
      id: userMessageId,
      role: "user",
      content: textToSend,
    }

    // Append user message immediately
    const updatedMessages = [...messages, newUserMessage]
    setMessages(updatedMessages)
    setInput("")

    // Add initial placeholder for the streaming response
    setMessages((prev) => [
      ...prev,
      { id: assistantMessageId, role: "assistant", content: "" },
    ])

    // Reset accumulated reply ref
    accumulatedReplyRef.current = ""

    try {
      const response = await fetch("/api/proxy/ai/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          message: textToSend,
          conversationHistory: updatedMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error(
          isVi
            ? "Không thể kết nối tới dịch vụ AI."
            : "Failed to connect to AI service."
        )
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error(
          isVi
            ? "Không thể đọc dữ liệu phản hồi."
            : "Cannot read response body stream."
        )
      }

      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunkText = decoder.decode(value, { stream: true })

        // Split chunks by newline since SSE events are line-based
        const lines = chunkText.split("\n")
        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed) continue

          let dataStr = trimmed
          // Strip SSE prefix if present
          if (trimmed.startsWith("data:")) {
            dataStr = trimmed.slice(5).trim()
          }

          if (dataStr === "[DONE]") continue

          try {
            const parsed = JSON.parse(dataStr)
            // Backend formats response inside AiResponseDto envelope: { success: true, data: { ... } }
            if (parsed.success && parsed.data) {
              const dataObj = parsed.data
              if (typeof dataObj === "string") {
                accumulatedReplyRef.current += dataObj
              } else if (typeof dataObj === "object") {
                accumulatedReplyRef.current +=
                  dataObj.text || dataObj.content || dataObj.message || ""
              }
            } else if (parsed.text) {
              accumulatedReplyRef.current += parsed.text
            } else if (parsed.content) {
              accumulatedReplyRef.current += parsed.content
            } else if (typeof parsed === "string") {
              accumulatedReplyRef.current += parsed
            }
          } catch {
            // If it's not valid JSON, treat it as raw text chunk
            accumulatedReplyRef.current += dataStr
          }
        }

        // Live-update the assistant reply in state using the immutable string snapshot
        const currentReplyText = accumulatedReplyRef.current
          .replace(/<!--\s*SOURCES:[\s\S]*?-->/gi, "")
          .trim()
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  content: currentReplyText,
                }
              : msg
          )
        )
      }
    } catch (err) {
      console.error("Chatbot streaming error:", err)
      const errorMsg = err instanceof Error ? err.message : String(err)
      setError(errorMsg)

      // Update the assistant message in history to show the error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: isVi
                  ? `❌ Đã xảy ra lỗi: ${errorMsg}`
                  : `❌ An error occurred: ${errorMsg}`,
              }
            : msg
        )
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setMessages([])
    setError(null)
    setInput("")
  }

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed right-6 bottom-6 z-40 flex items-center justify-center">
        {/* Subtle decorative ping ring for premium visual feedback */}
        <span className="absolute inline-flex size-14 h-full w-full animate-ping rounded-full bg-emerald-400 opacity-20"></span>
        <Button
          onClick={() => setOpen(true)}
          className="relative flex size-14 cursor-pointer items-center justify-center rounded-full border-none bg-linear-to-tr from-emerald-500 to-teal-600 text-white shadow-xl transition-all duration-300 hover:scale-105 hover:from-emerald-600 hover:to-teal-700 hover:text-white"
        >
          <MessageCircle className="size-6" />
        </Button>
      </div>

      {/* Chat Sidebar Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="flex h-full w-full flex-col border-l bg-slate-50 p-0 sm:max-w-md md:max-w-lg dark:bg-zinc-950">
          <SheetHeader className="flex flex-row items-center justify-between border-b bg-white p-4 dark:bg-zinc-900">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <Sparkles className="size-5" />
              </div>
              <div>
                <SheetTitle className="text-base font-semibold">
                  {isVi ? "Trợ lý AI PickleHub" : "PickleHub AI Assistant"}
                </SheetTitle>
                <p className="text-xs text-muted-foreground">
                  {isVi
                    ? "Hỏi đáp luật chơi và hướng dẫn Pickleball"
                    : "Ask questions about Pickleball rules & guide"}
                </p>
              </div>
            </div>
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleReset}
                title={isVi ? "Cuộc hội thoại mới" : "New conversation"}
                className="mr-6 h-8 w-8 text-muted-foreground hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950 dark:hover:text-emerald-400"
              >
                <Plus className="size-5" />
              </Button>
            )}
          </SheetHeader>

          {/* Chat Messages Log */}
          <div className="flex-1 overflow-hidden p-4">
            <ScrollArea className="h-full pr-4">
              {messages.length === 0 ? (
                /* Welcome suggestions screen */
                <div className="flex flex-col gap-6 py-6">
                  <div className="space-y-2 text-center">
                    <h3 className="text-sm font-medium text-foreground">
                      {isVi
                        ? "Tôi có thể giúp gì cho bạn hôm nay?"
                        : "How can I help you today?"}
                    </h3>
                    <p className="px-4 text-xs text-muted-foreground">
                      {isVi
                        ? "Hỏi tôi về luật thi đấu, dụng cụ hoặc các kỹ thuật dink, volley, serve..."
                        : "Ask me about official rules, equipment choices, or swing techniques."}
                    </p>
                  </div>
                  <div className="grid gap-2">
                    {suggestions.map((s, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        onClick={() => handleSendMessage(s.prompt)}
                        className="h-auto justify-start rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-left text-xs font-normal shadow-2xs transition-colors hover:bg-emerald-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-emerald-950"
                      >
                        {s.label}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Message list */
                <div className="flex flex-col gap-4 pb-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {msg.role === "assistant" && (
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="!bg-emerald-500 text-xs font-semibold !text-white">
                            <Bot className="size-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-2xs ${
                          msg.role === "user"
                            ? "bg-emerald-600 text-white dark:bg-emerald-700"
                            : "border border-slate-200 bg-white text-foreground dark:border-zinc-800 dark:bg-zinc-900"
                        }`}
                      >
                        {msg.role === "user" ? (
                          <div className="wrap-break-word whitespace-pre-wrap">
                            {msg.content}
                          </div>
                        ) : (
                          <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed wrap-break-word text-slate-800 dark:text-slate-200">
                            {msg.content === "" && isLoading ? (
                              <div className="flex animate-pulse items-center gap-2 py-1 text-xs text-muted-foreground">
                                <Loader2 className="h-3 w-3 animate-spin text-emerald-500" />
                                {isVi ? "Đang suy nghĩ..." : "Thinking..."}
                              </div>
                            ) : (
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                            )}
                          </div>
                        )}
                      </div>
                      {msg.role === "user" && (
                        <Avatar className="h-8 w-8 shrink-0">
                          {avatarUrl && (
                            <AvatarImage src={avatarUrl} alt="User Avatar" />
                          )}
                          <AvatarFallback className="!bg-indigo-500 text-xs font-semibold !text-white">
                            {userInitials}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}

                  {/* Show error notification bubble inside chat log if relevant */}
                  {error && (
                    <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-center text-xs text-red-500 dark:border-red-900/50 dark:bg-red-950/30">
                      {error}
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Form input area */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage(input)
            }}
            className="flex items-center gap-2 border-t bg-white p-4 dark:bg-zinc-900"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isVi ? "Nhập câu hỏi tại đây..." : "Type a message here..."
              }
              disabled={isLoading}
              className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm focus-visible:border-emerald-500 focus-visible:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-950"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              size="icon"
              className="h-9 w-9 shrink-0 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  )
}
