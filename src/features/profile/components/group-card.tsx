"use client"

import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Group } from "@/features/groups/types"
import { useProfileTranslation } from "@/i18n/use-profile-translation"

interface GroupCardProps {
  groups: Group[]
  isOwnProfile?: boolean
}

function getGroupInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

export function GroupCard({ groups, isOwnProfile = true }: GroupCardProps) {
  const { t } = useProfileTranslation()

  const cardTitle = isOwnProfile ? t("yourGroups") : t("groups", "Nhóm")
  const emptyText = isOwnProfile
    ? t("noGroups")
    : t("noGroupsUser", "Người dùng chưa tham gia nhóm nào.")

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>{cardTitle}</CardTitle>
      </CardHeader>

      <CardContent>
        {groups.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyText}</p>
        ) : (
          <ul className="space-y-2">
            {groups.map((group) => (
              <li key={group.id}>
                <Link
                  href={`/groups/${group.id}`}
                  className="group flex items-center gap-3 rounded-lg border px-3 py-2 transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted/40 hover:shadow-sm"
                >
                  <Avatar className="size-9">
                    <AvatarImage
                      src={group.avatarUrl ?? undefined}
                      alt={group.name}
                    />
                    <AvatarFallback>
                      {getGroupInitials(group.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="line-clamp-1 font-medium transition-colors group-hover:text-primary">
                    {group.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
