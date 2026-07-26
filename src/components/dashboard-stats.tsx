"use client"

import { MessageSquare, Users, Users2 } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Card } from "@/components/ui/card"

interface DashboardStats {
  groupsCount: number
  membersCount: number
  pendingInvitesCount: number
}

export function DashboardStats({
  groupsCount = 0,
  membersCount = 0,
  pendingInvitesCount = 0,
}: DashboardStats) {
  const { t } = useTranslation("common")
  const stats = [
    {
      label: t("dashboard.stats.groups"),
      value: groupsCount,
      icon: Users,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor:
        "bg-emerald-500/10 dark:bg-emerald-500/20 ring-1 ring-emerald-500/20",
    },
    {
      label: t("dashboard.stats.members"),
      value: membersCount,
      icon: Users2,
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor:
        "bg-indigo-500/10 dark:bg-indigo-500/20 ring-1 ring-indigo-500/20",
    },
    {
      label: t("dashboard.stats.pendingInvites"),
      value: pendingInvitesCount,
      icon: MessageSquare,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-500/10 dark:bg-amber-500/20 ring-1 ring-amber-500/20",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card
            key={stat.label}
            className="p-6 transition-all duration-200 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold tracking-tight">
                  {stat.value}
                </p>
              </div>
              <div
                className={`flex size-12 items-center justify-center rounded-xl shadow-xs transition-transform duration-200 hover:scale-105 ${stat.bgColor}`}
              >
                <Icon className={`size-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
