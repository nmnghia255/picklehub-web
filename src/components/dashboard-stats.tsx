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
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      label: t("dashboard.stats.members"),
      value: membersCount,
      icon: Users2,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      label: t("dashboard.stats.pendingInvites"),
      value: pendingInvitesCount,
      icon: MessageSquare,
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-950",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div
                className={`flex size-12 items-center justify-center rounded-lg ${stat.bgColor}`}
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
