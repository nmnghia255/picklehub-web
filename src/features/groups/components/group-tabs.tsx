"use client"

import { Search, Users } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Group } from "@/features/groups/types"

interface GroupTabsProps {
  myGroups: Group[]
  discoverGroups: Group[]
}

function formatRole(role: string | null | undefined) {
  if (!role) return "member"
  return role.toLowerCase()
}

function getGroupInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

export function GroupTabs({ myGroups, discoverGroups }: GroupTabsProps) {
  const [searchKeyword, setSearchKeyword] = useState("")
  const safeMyGroups = Array.isArray(myGroups) ? myGroups : []
  const safeDiscoverGroups = Array.isArray(discoverGroups) ? discoverGroups : []

  const filteredDiscoverGroups = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase()

    if (!keyword) {
      return safeDiscoverGroups
    }

    return safeDiscoverGroups.filter((group) => {
      const name = group.name.toLowerCase()
      const description = (group.description ?? "").toLowerCase()
      return name.includes(keyword) || description.includes(keyword)
    })
  }, [safeDiscoverGroups, searchKeyword])

  return (
    <Tabs defaultValue="your-groups" className="gap-6">
      <TabsList>
        <TabsTrigger value="your-groups">Nhóm của bạn</TabsTrigger>
        <TabsTrigger value="discover">Khám phá</TabsTrigger>
      </TabsList>

      <TabsContent value="your-groups">
        {safeMyGroups.length === 0 ? (
          <Empty className="rounded-xl border">
            <EmptyHeader>
              <EmptyTitle>Bạn chưa tham gia nhóm nào</EmptyTitle>
              <EmptyDescription>
                Tham gia hoặc tạo một nhóm để xem nó ở đây.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {safeMyGroups.map((group) => (
              <Card key={group.id}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        src={group.avatarUrl ?? undefined}
                        alt={group.name}
                      />
                      <AvatarFallback>
                        {getGroupInitials(group.name)}
                      </AvatarFallback>
                    </Avatar>
                    <CardTitle className="line-clamp-1 text-lg">
                      {group.name}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {group.description && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {group.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Users className="size-4" />
                      <span>{group.memberCount} thành viên</span>
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      {formatRole(group.role)}
                    </Badge>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href={`/groups/${group.id}`}>Mở</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="discover" className="space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search groups"
            className="pl-9"
            value={searchKeyword}
            onChange={(event) => setSearchKeyword(event.target.value)}
            aria-label="Search groups"
          />
        </div>

        {filteredDiscoverGroups.length === 0 ? (
          <Empty className="rounded-xl border">
            <EmptyHeader>
              <EmptyTitle>Không có nhóm nào phù hợp</EmptyTitle>
              <EmptyDescription>
                Thử một từ khóa khác để khám phá các nhóm.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredDiscoverGroups.map((group) => (
              <Card key={group.id}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        src={group.avatarUrl ?? undefined}
                        alt={group.name}
                      />
                      <AvatarFallback>
                        {getGroupInitials(group.name)}
                      </AvatarFallback>
                    </Avatar>
                    <CardTitle className="line-clamp-1 text-lg">
                      {group.name}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {group.description && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {group.description}
                    </p>
                  )}
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Users className="size-4" />
                    <span>{group.memberCount} thành viên</span>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href={`/groups/${group.id}`}>Xem chi tiết</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
