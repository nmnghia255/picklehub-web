"use client"

import { Plus, UserCheck, Users } from "lucide-react"
import Link from "next/link"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function DashboardQuickActions() {
  const { t } = useTranslation("common")

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card className="flex flex-col gap-4 p-6">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
          <Plus className="size-5 text-primary" />
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold">
            {t("dashboard.quickActions.createGroup.title")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("dashboard.quickActions.createGroup.description")}
          </p>
        </div>
        <Button size="sm" asChild className="mt-auto">
          <Link href="/groups/create">
            {t("dashboard.quickActions.createGroup.button")}
          </Link>
        </Button>
      </Card>

      <Card className="flex flex-col gap-4 p-6">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
          <Users className="size-5 text-primary" />
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold">
            {t("dashboard.quickActions.myGroups.title")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("dashboard.quickActions.myGroups.description")}
          </p>
        </div>
        <Button size="sm" variant="outline" asChild className="mt-auto">
          <Link href="/groups">
            {t("dashboard.quickActions.myGroups.button")}
          </Link>
        </Button>
      </Card>

      <Card className="flex flex-col gap-4 p-6">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
          <UserCheck className="size-5 text-primary" />
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold">
            {t("dashboard.quickActions.profile.title")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("dashboard.quickActions.profile.description")}
          </p>
        </div>
        <Button size="sm" variant="outline" asChild className="mt-auto">
          <Link href="/profile">
            {t("dashboard.quickActions.profile.button")}
          </Link>
        </Button>
      </Card>
    </div>
  )
}
