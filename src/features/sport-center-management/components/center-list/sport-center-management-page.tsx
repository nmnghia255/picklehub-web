"use client"

import { useQuery } from "@tanstack/react-query"
import { Building2, Plus, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

import { sportCenterWizardClient } from "../../api/sport-center-wizard-client"
import { sportCenterOwnerListQueryKey } from "../../queries"
import type { SportCenter } from "../../types/sport-center"
import { CenterListSkeleton } from "./center-list-skeleton"
import { SportCenterDeleteDialog } from "./sport-center-delete-dialog"
import { SportCenterEditDialog } from "./sport-center-edit-dialog"
import { SportCenterManagementCard } from "./sport-center-management-card"

export function SportCenterManagementPage() {
  const { t } = useSportCenterManagementTranslation()
  const [deleteTarget, setDeleteTarget] = useState<SportCenter | null>(null)
  const [editTarget, setEditTarget] = useState<SportCenter | null>(null)

  const centersQuery = useQuery({
    queryKey: sportCenterOwnerListQueryKey,
    queryFn: sportCenterWizardClient.listOwnerSportCenters,
  })

  const locale = typeof navigator === "undefined" ? "en-US" : navigator.language
  const centers = centersQuery.data ?? []

  return (
    <div className="space-y-6">
      <section className="flex items-end justify-end gap-4">
        <Button asChild size="lg" className="w-full lg:w-auto">
          <Link href="/sport-center-management/create">
            <Plus />
            {t("centerList.actions.create")}
          </Link>
        </Button>
      </section>

      {centersQuery.isLoading ? (
        <CenterListSkeleton />
      ) : centersQuery.isError ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
            <Building2 className="size-10 text-destructive" />
            <div className="space-y-1">
              <h2 className="font-semibold">{t("centerList.error.title")}</h2>
              <p className="text-sm text-muted-foreground">
                {t("centerList.error.description")}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => centersQuery.refetch()}
            >
              <RefreshCw />
              {t("centerList.actions.retry")}
            </Button>
          </CardContent>
        </Card>
      ) : centers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
              <Building2 className="size-8 text-primary" />
            </div>
            <div className="space-y-1">
              <h2 className="font-semibold">{t("centerList.empty.title")}</h2>
              <p className="max-w-md text-sm text-muted-foreground">
                {t("centerList.empty.description")}
              </p>
            </div>
            <Button asChild>
              <Link href="/sport-center-management/create">
                <Plus />
                {t("centerList.empty.action")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {centers.map((center) => (
            <SportCenterManagementCard
              key={center.id}
              center={center}
              onEdit={setEditTarget}
              onDelete={setDeleteTarget}
              deleting={deleteTarget?.id === center.id}
              locale={locale}
            />
          ))}
        </div>
      )}

      <SportCenterDeleteDialog
        center={deleteTarget}
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
      />

      <SportCenterEditDialog
        center={editTarget}
        open={Boolean(editTarget)}
        onClose={() => setEditTarget(null)}
      />
    </div>
  )
}
