"use client"

import {
  MessageCircle,
  Search,
  UserCheck,
  UserPlus,
  UserRoundX,
  XCircle,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { FriendUser, SortKey, TabKey } from "@/features/friend/types"
import {
  filterUsersByUsername,
  getInitials,
  sortUsers,
} from "@/features/friend/utils"

type UsersByTab = Record<TabKey, FriendUser[]>

export default function FriendClient({
  initialUsersByTab,
}: {
  initialUsersByTab: UsersByTab
}) {
  const [activeTab, setActiveTab] = useState<TabKey>("find")
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<SortKey>("alphabet")
  const [usersByTab, setUsersByTab] = useState<UsersByTab>(initialUsersByTab)
  const [selectedUser, setSelectedUser] = useState<FriendUser | null>(null)
  const [isLoadingFind, setIsLoadingFind] = useState(false)
  const [processingIds, setProcessingIds] = useState<Record<string, boolean>>(
    {}
  )

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()
    const shouldLoadFindUsers = activeTab === "find"

    async function loadFindUsers() {
      if (!shouldLoadFindUsers) {
        return
      }

      const keyword = search.trim() || "a"

      setIsLoadingFind(true)

      try {
        const query = new URLSearchParams({
          q: keyword,
          page: "1",
          limit: "100",
        })

        const response = await fetch(`/api/friends/find?${query.toString()}`, {
          method: "GET",
          cache: "no-store",
          credentials: "include",
          signal: controller.signal,
        })

        if (!response.ok) return

        const payload = (await response.json()) as {
          data?: FriendUser[]
        }

        if (isMounted && Array.isArray(payload.data)) {
          setUsersByTab((prev) => ({
            ...prev,
            find: payload.data ?? prev.find,
          }))
        }
      } finally {
        if (isMounted) {
          setIsLoadingFind(false)
        }
      }
    }

    void loadFindUsers()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [activeTab, search])

  const users = useMemo(() => {
    const rawUsers = usersByTab[activeTab]
    if (activeTab === "find") {
      return sortUsers(rawUsers, sortBy)
    }

    const byKeyword = filterUsersByUsername(rawUsers, search)
    return sortUsers(byKeyword, sortBy)
  }, [activeTab, search, sortBy, usersByTab])

  const runAction = async (key: string, fn: () => Promise<void>) => {
    if (processingIds[key]) {
      return
    }

    setProcessingIds((prev) => ({ ...prev, [key]: true }))
    try {
      await fn()
    } finally {
      setProcessingIds((prev) => ({ ...prev, [key]: false }))
    }
  }

  const handleSendRequest = async (user: FriendUser) => {
    await runAction(`find-${user.id}`, async () => {
      const response = await fetch("/api/friends/requests", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ receiverId: user.id }),
      })

      if (!response.ok) {
        return
      }

      const payload = (await response.json()) as { data?: { id?: string } }
      const requestId = payload.data?.id ?? user.id

      setUsersByTab((prev) => ({
        ...prev,
        find: prev.find.filter((item) => item.id !== user.id),
        sent: [
          {
            ...user,
            id: requestId,
            counterpartId: user.id,
            invitedAt: new Date().toISOString(),
            inviteSource: "Web",
            bio: "Lời mời kết bạn đã gửi",
          },
          ...prev.sent,
        ],
      }))
    })
  }

  const handleCancelRequest = async (requestId: string) => {
    await runAction(`sent-${requestId}`, async () => {
      const response = await fetch(
        `/api/friends/requests/${requestId}/cancel`,
        {
          method: "PATCH",
          credentials: "include",
        }
      )

      if (!response.ok) {
        return
      }

      setUsersByTab((prev) => ({
        ...prev,
        sent: prev.sent.filter((item) => item.id !== requestId),
      }))
    })
  }

  const handleAcceptRequest = async (request: FriendUser) => {
    const requestId = request.id
    await runAction(`received-accept-${requestId}`, async () => {
      const response = await fetch(
        `/api/friends/requests/${requestId}/accept`,
        {
          method: "PATCH",
          credentials: "include",
        }
      )

      if (!response.ok) {
        return
      }

      const friendUser: FriendUser = {
        ...request,
        id: request.counterpartId ?? request.id,
        bio: "Đã là bạn bè",
        becameFriendAt: new Date().toISOString(),
        friendshipSinceLabel: "Vừa kết bạn",
      }

      setUsersByTab((prev) => ({
        ...prev,
        received: prev.received.filter((item) => item.id !== requestId),
        friends: [friendUser, ...prev.friends],
      }))
    })
  }

  const handleRejectRequest = async (requestId: string) => {
    await runAction(`received-reject-${requestId}`, async () => {
      const response = await fetch(
        `/api/friends/requests/${requestId}/reject`,
        {
          method: "PATCH",
          credentials: "include",
        }
      )

      if (!response.ok) {
        return
      }

      setUsersByTab((prev) => ({
        ...prev,
        received: prev.received.filter((item) => item.id !== requestId),
      }))
    })
  }

  const handleRemoveFriend = async (friendId: string) => {
    await runAction(`friends-${friendId}`, async () => {
      const response = await fetch(`/api/friends/${friendId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        return
      }

      setUsersByTab((prev) => ({
        ...prev,
        friends: prev.friends.filter((item) => item.id !== friendId),
      }))
    })
  }

  return (
    <div className="container mx-auto max-w-5xl p-6">
      <div className="mb-6 rounded-2xl border bg-linear-to-r from-primary/10 via-sky-500/5 to-emerald-500/10 p-5">
        <h1 className="text-3xl font-bold">Bạn bè</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Quản lý lời mời, kết nối mới và danh sách bạn bè của bạn tại một nơi.
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as TabKey)}
      >
        <TabsList className="grid h-auto w-full grid-cols-2 gap-2 bg-transparent p-0 md:grid-cols-4">
          <TabsTrigger value="find">Tìm bạn</TabsTrigger>
          <TabsTrigger value="sent">Đã gửi</TabsTrigger>
          <TabsTrigger value="received">Đã nhận</TabsTrigger>
          <TabsTrigger value="friends">Bạn bè</TabsTrigger>
        </TabsList>

        <div className="mt-4 flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
              placeholder="Tìm kiếm theo tên, username hoặc email..."
            />
          </div>

          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as SortKey)}
          >
            <SelectTrigger className="w-full sm:w-60">
              <SelectValue placeholder="Sắp xếp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alphabet">Theo chữ cái (A-Z)</SelectItem>
              <SelectItem value="friendTime">Theo thời gian kết bạn</SelectItem>
              <SelectItem value="inviteTime">
                Theo thời gian gửi lời mời
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(Object.keys(initialUsersByTab) as TabKey[]).map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4">
            <Card className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">
                    {tab === "find"
                      ? "Tìm bạn"
                      : tab === "sent"
                        ? "Lời mời bạn đã gửi"
                        : tab === "received"
                          ? "Lời mời gửi đến bạn"
                          : "Danh sách bạn bè"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {tab === "find" && isLoadingFind
                      ? "Đang tải danh sách người dùng..."
                      : `Tổng cộng ${users.length} người dùng`}
                  </p>
                </div>
              </div>

              {users.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                  Không có dữ liệu phù hợp với bộ lọc hiện tại.
                </div>
              ) : (
                <div className="space-y-3">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          className="cursor-pointer"
                          onClick={() => setSelectedUser(user)}
                          aria-label={`Xem hồ sơ ${user.username}`}
                        >
                          <Avatar size="lg" className="ring-2 ring-background">
                            <AvatarImage
                              src={user.avatarUrl}
                              alt={user.fullName}
                            />
                            <AvatarFallback>
                              {getInitials(user.fullName)}
                            </AvatarFallback>
                          </Avatar>
                        </button>

                        <div>
                          <p className="font-semibold">{user.fullName}</p>
                          <p className="text-sm text-muted-foreground">
                            @{user.username}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Badge variant="secondary">{user.level}</Badge>
                            <Badge variant="outline">{user.location}</Badge>
                            <Badge variant="ghost">
                              {user.mutualFriends} bạn chung
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-start gap-2 sm:items-end">
                        <div className="mt-1 flex flex-wrap gap-2">
                          {tab === "find" &&
                            (() => {
                              const status = user.friendshipStatus ?? "NONE"
                              const canSendRequest = status === "NONE"
                              const actionLabel =
                                status === "FRIEND"
                                  ? "Đã là bạn bè"
                                  : status === "REQUEST_SENT"
                                    ? "Đã gửi lời mời"
                                    : status === "REQUEST_RECEIVED"
                                      ? "Đã nhận lời mời"
                                      : "Kết bạn"

                              return status === "FRIEND" ? (
                                <Button
                                  size="sm"
                                  disabled
                                  aria-label="Đã là bạn bè"
                                  className="bg-gray-100 text-gray-800 hover:bg-gray-100"
                                >
                                  <UserCheck
                                    className="mr-2 size-5 text-emerald-700"
                                    strokeWidth={1.8}
                                  />
                                  <span className="font-semibold text-gray-800">
                                    Đã là bạn bè
                                  </span>
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  disabled={
                                    !canSendRequest ||
                                    Boolean(processingIds[`find-${user.id}`])
                                  }
                                  onClick={() => handleSendRequest(user)}
                                >
                                  <UserPlus className="size-4" />
                                  {actionLabel}
                                </Button>
                              )
                            })()}

                          {tab === "sent" && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={Boolean(
                                processingIds[`sent-${user.id}`]
                              )}
                              onClick={() => handleCancelRequest(user.id)}
                            >
                              <XCircle className="size-4" />
                              Hủy lời mời
                            </Button>
                          )}

                          {tab === "received" && (
                            <>
                              <Button
                                size="sm"
                                disabled={Boolean(
                                  processingIds[`received-accept-${user.id}`]
                                )}
                                onClick={() => handleAcceptRequest(user)}
                              >
                                Chấp nhận
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={Boolean(
                                  processingIds[`received-reject-${user.id}`]
                                )}
                                onClick={() => handleRejectRequest(user.id)}
                              >
                                Từ chối
                              </Button>
                            </>
                          )}

                          {tab === "friends" && (
                            <>
                              <Button size="sm" type="button">
                                <MessageCircle className="size-4" />
                                Chat
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={Boolean(
                                  processingIds[`friends-${user.id}`]
                                )}
                                onClick={() => handleRemoveFriend(user.id)}
                              >
                                <UserRoundX className="size-4" />
                                Hủy kết bạn
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Dialog
        open={Boolean(selectedUser)}
        onOpenChange={(open) => !open && setSelectedUser(null)}
      >
        <DialogContent>
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle>Hồ sơ người dùng</DialogTitle>
                <DialogDescription>
                  Thông tin để xem trước giao diện profile trên modal.
                </DialogDescription>
              </DialogHeader>

              <div className="flex items-start gap-4">
                <Avatar size="lg">
                  <AvatarImage
                    src={selectedUser.avatarUrl}
                    alt={selectedUser.fullName}
                  />
                  <AvatarFallback>
                    {getInitials(selectedUser.fullName)}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <p className="text-lg font-semibold">
                    {selectedUser.fullName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    @{selectedUser.username}
                  </p>
                  <p className="mt-2 text-sm">{selectedUser.bio}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="secondary">{selectedUser.level}</Badge>
                    <Badge variant="outline">{selectedUser.location}</Badge>
                    <Badge variant="ghost">
                      {selectedUser.mutualFriends} bạn chung
                    </Badge>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
