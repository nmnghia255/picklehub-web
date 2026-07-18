"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"

import { PageContainer } from "@/components/page-container"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { sportCenterWizardClient } from "@/features/sport-center-management/api/sport-center-wizard-client"
import { CourtManagementPanel } from "@/features/sport-center-management/components/court-management-panel"
import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

export default function SportCenterManagementDetailPage() {
  const { t } = useSportCenterManagementTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams<{ centerId: string }>()
  const centerId = params.centerId
  const activeTab = searchParams.get("tab") === "courts" ? "courts" : "overview"

  const { data, isLoading, error } = useQuery({
    queryKey: ["sport-center-management", "detail", centerId],
    queryFn: async () => {
      const center = await sportCenterWizardClient.getSportCenter(centerId)
      const [courts, priceSlots, policy] = await Promise.all([
        sportCenterWizardClient.listCourts(centerId),
        sportCenterWizardClient.listPriceSlots(centerId),
        sportCenterWizardClient.getCancellationPolicy(centerId),
      ])

      // The Services and Products GET endpoints expose active catalog data
      // only. Newly created centers are INACTIVE until activated, so those
      // requests must not run while the center is inactive.
      const [services, products] =
        center.status === "ACTIVE"
          ? await Promise.all([
              sportCenterWizardClient.listServices(centerId),
              sportCenterWizardClient.listProducts(centerId),
            ])
          : [[], []]

      return { center, courts, priceSlots, policy, services, products }
    },
    enabled: Boolean(centerId),
  })

  return (
    <PageContainer variant="wide" className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 rounded-3xl border bg-card/80 p-6 shadow-sm md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <Badge variant="secondary">
            {t("createCenter.detail.badge")}
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight">
            {t("createCenter.detail.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("createCenter.detail.subtitle")}
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.back()}>
            {t("common.back")}
          </Button>
          <Button asChild>
            <Link href={`/sport-center-management/${centerId}?tab=courts`}>
              {t("managementDetail.actions.manageCourts")}
            </Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-44 rounded-3xl" />
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-6 text-sm text-destructive">
            {error instanceof Error
              ? error.message
              : t("createCenter.detail.loadError")}
          </CardContent>
        </Card>
      ) : data ? (
        <>
          <div className="flex gap-2 border-b pb-2">
            <Button asChild size="sm" variant={activeTab === "overview" ? "default" : "ghost"}>
              <Link href={`/sport-center-management/${centerId}`}>
                {t("managementDetail.tabs.overview")}
              </Link>
            </Button>
            <Button asChild size="sm" variant={activeTab === "courts" ? "default" : "ghost"}>
              <Link href={`/sport-center-management/${centerId}?tab=courts`}>
                {t("managementDetail.tabs.courts")}
              </Link>
            </Button>
          </div>

          {activeTab === "courts" ? (
            <CourtManagementPanel centerId={centerId} initialCourts={data.courts} />
          ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {t("createCenter.review.center")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p className="font-medium">{data.center.name}</p>
                <p className="text-muted-foreground">{data.center.address}</p>
                <p>
                  {data.center.openTime} - {data.center.closeTime}
                </p>
                <p>{data.center.paymentBankName}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {t("createCenter.review.pricing")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p>{data.priceSlots.length}</p>
                <p className="text-muted-foreground">
                  {data.priceSlots
                    .map((slot) => `${slot.startTime}-${slot.endTime}`)
                    .join(", ")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {t("createCenter.review.courts")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p>{data.courts.length}</p>
                <p className="text-muted-foreground">
                  {data.courts.map((court) => court.name).join(", ")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {t("createCenter.review.services")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p>
                  {data.services.length} / {data.products.length}
                </p>
                <p className="text-muted-foreground">
                  {t("createCenter.review.policy")}
                  :{" "}
                  {data.policy.allowCancellation
                    ? t("common.yes")
                    : t("common.no")}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  {t("createCenter.review.courts")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.courts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t("createCenter.review.skippedCourts")}
                  </p>
                ) : (
                  data.courts.map((court) => (
                    <div
                      key={court.id}
                      className="flex items-center justify-between rounded-2xl border bg-muted/20 px-4 py-3 text-sm"
                    >
                      <span>{court.name}</span>
                      <span>{court.type}</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {t("createCenter.review.policy")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">
                  {t("createCenter.fields.allowCancellation")}
                  :{" "}
                  {data.policy.allowCancellation
                    ? t("common.yes")
                    : t("common.no")}
                </p>
                <div className="space-y-2">
                  {data.policy.tiers.map((tier) => (
                    <div
                      key={tier.id}
                      className="flex items-center justify-between rounded-2xl border bg-muted/20 px-4 py-3 text-sm"
                    >
                      <span>{tier.minDaysBeforeStart}d</span>
                      <span>{tier.refundPercent}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  {t("createCenter.review.services")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.services.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t("createCenter.review.skippedInventory")}
                  </p>
                ) : (
                  data.services.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between rounded-2xl border bg-muted/20 px-4 py-3 text-sm"
                    >
                      <span>{service.name}</span>
                      <span>{service.type}</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {t("createCenter.review.products")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.products.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t("createCenter.review.skippedInventory")}
                  </p>
                ) : (
                  data.products.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between rounded-2xl border bg-muted/20 px-4 py-3 text-sm"
                    >
                      <span>{product.name}</span>
                      <span>{product.type}</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
          )}
        </>
      ) : null}
    </PageContainer>
  )
}
