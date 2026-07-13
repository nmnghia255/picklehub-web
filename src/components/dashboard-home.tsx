"use client"

import { Suspense } from "react"
import { useTranslation } from "react-i18next"

import { DashboardGroups } from "@/components/dashboard-groups"
import { DashboardPendingInvites } from "@/components/dashboard-pending-invites"
import { DashboardQuickActions } from "@/components/dashboard-quick-actions"
import { DashboardStats } from "@/components/dashboard-stats"

interface Group {
  id: string
  name: string
  description?: string
  memberCount: number
  role: "OWNER" | "MEMBER"
}

interface DashboardHomeContentProps {
  userName: string | null
  groups: Group[]
  groupsCount: number
  membersCount: number
  pendingInvitesCount: number
}

export function DashboardHomeContent({
  userName,
  groups,
  groupsCount,
  membersCount,
  pendingInvitesCount,
}: DashboardHomeContentProps) {
  const { t } = useTranslation("common")
  const displayName = userName || t("header.defaultUser")

  return (
    <div className="container mx-auto max-w-6xl">
      <div className="flex flex-col gap-8 px-6 py-8 md:px-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {t("home.welcome.title", { name: displayName })}
          </h1>
          <p className="text-muted-foreground">
            {t("home.welcome.description")}
          </p>
        </div>

        <Suspense
          fallback={<div className="h-24 animate-pulse rounded-lg bg-muted" />}
        >
          <DashboardStats
            groupsCount={groupsCount}
            membersCount={membersCount}
            pendingInvitesCount={pendingInvitesCount}
          />
        </Suspense>

        <Suspense
          fallback={<div className="h-32 animate-pulse rounded-lg bg-muted" />}
        >
          <DashboardQuickActions />
        </Suspense>

        {pendingInvitesCount > 0 && (
          <Suspense
            fallback={
              <div className="h-32 animate-pulse rounded-lg bg-muted" />
            }
          >
            <DashboardPendingInvites invites={[]} />
          </Suspense>
        )}

        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-2xl font-bold">{t("home.groups.title")}</h2>
            <p className="text-muted-foreground">
              {t("home.groups.description")}
            </p>
          </div>
          <Suspense
            fallback={
              <div className="h-40 animate-pulse rounded-lg bg-muted" />
            }
          >
            <DashboardGroups groups={groups} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
