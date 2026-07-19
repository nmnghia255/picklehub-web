import { Users } from "lucide-react"
import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { Group } from "@/features/groups/types"
import { useGroupsTranslation } from "@/i18n/use-groups-translation"

import { isArchivedGroup } from "../../utils/group-status"

type Props = {
  group: Group
  actionLabel?: string
  showRole?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatRole(role: string | null | undefined, t: any) {
  switch (role) {
    case "owner":
      return t("dashboard.roleOwner", "Trưởng nhóm")
    case "member":
      return t("members")
    default:
      return role ?? "..."
  }
}

function getGroupInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

export function GroupCard({ group, showRole = false }: Props) {
  const { t } = useGroupsTranslation()
  const archived = isArchivedGroup(group.status)
  const coverSrc = group.avatarUrl || "/group-default.jpeg"

  return (
    <Link href={`/groups/${group.id}`} className="group block h-full">
      <Card className="flex h-full flex-col overflow-hidden py-0 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg dark:border-zinc-800">
        {/* Banner Cover Header - Extended height */}
        <div className="relative h-40 w-full overflow-hidden bg-slate-900 sm:h-44">
          <img
            src={coverSrc}
            alt={group.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/15 to-transparent" />
        </div>

        {/* Avatar Overlapping Header & Title */}
        <div className="relative px-5 pt-0">
          <div className="-mt-10 mb-3 flex items-end justify-between gap-3 sm:-mt-12">
            <Avatar className="size-16 shrink-0 border-4 border-card shadow-md transition-transform duration-300 group-hover:scale-105 sm:size-20">
              <AvatarFallback className="bg-emerald-100 text-lg font-extrabold text-emerald-800 sm:text-xl dark:bg-emerald-950 dark:text-emerald-300">
                {getGroupInitials(group.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex items-center gap-1.5 pb-1">
              {showRole ? (
                <Badge className="border border-emerald-200 bg-emerald-100 font-semibold text-emerald-800 capitalize shadow-xs dark:border-emerald-800/50 dark:bg-emerald-950/80 dark:text-emerald-300">
                  {formatRole(group.role, t)}
                </Badge>
              ) : null}
              {archived ? (
                <Badge
                  variant="secondary"
                  className="bg-background/95 text-muted-foreground shadow-xs backdrop-blur-xs"
                >
                  {t("archived", "Đã lưu trữ")}
                </Badge>
              ) : null}
            </div>
          </div>

          <h3 className="line-clamp-1 text-lg font-bold tracking-tight text-foreground transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
            {group.name}
          </h3>
        </div>

        {/* Card Content & Footer Info */}
        <CardContent className="flex flex-1 flex-col justify-between gap-4 p-5 pt-2">
          {group.description ? (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {group.description}
            </p>
          ) : (
            <p className="line-clamp-2 text-sm text-muted-foreground/60 italic">
              {t("dashboard.noDescription", "Chưa có mô tả")}
            </p>
          )}

          <div className="mt-auto flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 font-medium">
              <Users className="size-4 text-emerald-600 dark:text-emerald-400" />
              <span>
                {t("membersCount", "{{count}} members", {
                  count: group.memberCount,
                })}
              </span>
            </div>
            <span className="text-xs font-semibold text-emerald-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:text-emerald-400">
              {t("dashboard.openGroupBtn", "Xem nhóm")} &rarr;
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
