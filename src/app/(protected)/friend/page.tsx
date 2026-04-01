"use client"

import {
  MessageCircle,
  Search,
  UserPlus,
  UserRoundX,
  XCircle,
} from "lucide-react"
import { useMemo, useState } from "react"

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
import {
  MOCK_USERS,
  SORT_LABELS,
  TAB_TITLES,
} from "@/features/friend/mock-data"
import type { FriendUser, SortKey, TabKey } from "@/features/friend/types"
import {
  filterUsersByUsername,
  getInitials,
  sortUsers,
} from "@/features/friend/utils"

export default function FriendPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("find")
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<SortKey>("alphabet")
  const [usersByTab, setUsersByTab] = useState(MOCK_USERS)
  const [selectedUser, setSelectedUser] = useState<FriendUser | null>(null)

  const users = useMemo(() => {
    const rawUsers = usersByTab[activeTab]
    const byKeyword = filterUsersByUsername(rawUsers, search)
    return sortUsers(byKeyword, sortBy)
  }, [activeTab, search, sortBy, usersByTab])

  const handleAction = (userId: string) => {
    setUsersByTab((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab].filter((item) => item.id !== userId),
    }))
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
              placeholder="Tìm kiếm theo username..."
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
              <SelectItem value="alphabet">{SORT_LABELS.alphabet}</SelectItem>
              <SelectItem value="friendTime">
                {SORT_LABELS.friendTime}
              </SelectItem>
              <SelectItem value="inviteTime">
                {SORT_LABELS.inviteTime}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(Object.keys(TAB_TITLES) as TabKey[]).map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4">
            <Card className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{TAB_TITLES[tab]}</h2>
                  <p className="text-sm text-muted-foreground">
                    Tổng cộng {users.length} người dùng
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
                          {tab === "find" && (
                            <Button
                              size="sm"
                              onClick={() => handleAction(user.id)}
                            >
                              <UserPlus className="size-4" />
                              Kết bạn
                            </Button>
                          )}

                          {tab === "sent" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAction(user.id)}
                            >
                              <XCircle className="size-4" />
                              Hủy lời mời
                            </Button>
                          )}

                          {tab === "received" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleAction(user.id)}
                              >
                                Chấp nhận
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAction(user.id)}
                              >
                                Từ chối
                              </Button>
                            </>
                          )}

                          {tab === "friends" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleAction(user.id)}
                              >
                                <MessageCircle className="size-4" />
                                Chat
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAction(user.id)}
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
                  Thông tin mock để xem trước giao diện profile trên modal.
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
