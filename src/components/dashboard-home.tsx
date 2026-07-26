"use client"

import { Sparkles, Users } from "lucide-react"
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
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400">
            <Sparkles className="size-6" />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight">
              {t("home.welcome.title", { name: displayName })}
            </h1>
            <p className="text-muted-foreground">
              {t("home.welcome.description")}
            </p>
          </div>
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
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 ring-1 ring-indigo-500/20 dark:bg-indigo-500/20 dark:text-indigo-400">
              <Users className="size-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{t("home.groups.title")}</h2>
              <p className="text-muted-foreground">
                {t("home.groups.description")}
              </p>
            </div>
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
