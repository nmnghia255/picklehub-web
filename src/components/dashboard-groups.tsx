"use client"

import { MoreHorizontal, Settings, Users2 } from "lucide-react"
import Link from "next/link"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Group {
  id: string
  name: string
  description?: string
  memberCount: number
  role: "OWNER" | "MEMBER"
}

interface DashboardGroupsProps {
  groups: Group[]
  isLoading?: boolean
}

export function DashboardGroups({
  groups = [],
  isLoading = false,
}: DashboardGroupsProps) {
  const { t } = useTranslation("common")

  if (isLoading) {
    return (
      <Card className="p-8">
        <p className="text-center text-muted-foreground">
          {t("dashboard.groups.loading")}
        </p>
      </Card>
    )
  }

  if (groups.length === 0) {
    return (
      <Card className="p-12">
        <div className="flex flex-col items-center gap-3 text-center">
          <Users2 className="size-12 text-muted-foreground/50" />
          <div>
            <p className="font-semibold">{t("dashboard.groups.emptyTitle")}</p>
            <p className="text-sm text-muted-foreground">
              {t("dashboard.groups.emptyDescription")}
            </p>
          </div>
          <Button asChild className="mt-4">
            <Link href="/groups/create">
              {t("dashboard.groups.createButton")}
            </Link>
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="grid gap-4">
      {groups.map((group) => (
        <Card
          key={group.id}
          className="p-4 transition-shadow hover:shadow-md md:p-6"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Link
              href={`/groups/${group.id}`}
              className="flex-1 transition-opacity hover:opacity-75"
            >
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold">{group.name}</h3>
                {group.description && (
                  <p className="line-clamp-1 text-sm text-muted-foreground">
                    {group.description}
                  </p>
                )}
                <div className="flex items-center gap-3 pt-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Users2 className="size-3" />
                    {t("dashboard.groups.members", {
                      count: group.memberCount,
                    })}
                  </span>
                  <span className="inline-block rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    {t(
                      group.role === "OWNER"
                        ? "dashboard.groups.role.owner"
                        : "dashboard.groups.role.member"
                    )}
                  </span>
                </div>
              </div>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/groups/${group.id}`}>
                    {t("dashboard.groups.viewDetails")}
                  </Link>
                </DropdownMenuItem>
                {group.role === "OWNER" && (
                  <DropdownMenuItem asChild>
                    <Link href={`/groups/${group.id}/settings`}>
                      <Settings className="mr-2 size-4" />
                      {t("dashboard.groups.settings")}
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Card>
      ))}
    </div>
  )
}
