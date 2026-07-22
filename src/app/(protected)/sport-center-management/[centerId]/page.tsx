"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"

import { FallbackImage } from "@/components/fallback-image"
import { PageContainer } from "@/components/page-container"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { sportCenterWizardClient } from "@/features/sport-center-management/api/sport-center-wizard-client"
import { CenterPricingPolicyPanel } from "@/features/sport-center-management/components/center-pricing-policy-panel"
import { CourtManagementPanel } from "@/features/sport-center-management/components/court-management-panel"
import { ServicesProductsManagementPage } from "@/features/sport-center-management/services-products-management/components/services-products-management-page"
import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

export default function SportCenterManagementDetailPage() {
  const { t } = useSportCenterManagementTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams<{ centerId: string }>()
  const centerId = params.centerId
  const requestedTab = searchParams.get("tab")
  const activeTab = ["courts", "price-slots", "policy", "inventory"].includes(
    requestedTab ?? ""
  )
    ? requestedTab
    : "overview"

  const cleanList = (items: string[] | null | undefined) =>
    (items ?? []).map((item) => item.trim()).filter(Boolean)

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
          <Badge variant="secondary">{t("createCenter.detail.badge")}</Badge>
          <h1 className="text-3xl font-semibold tracking-tight">
            {t("createCenter.detail.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("createCenter.detail.subtitle")}
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/sport-center-management")}
          >
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
      ) : data?.center ? (
        <>
          <div className="flex gap-2 border-b pb-2">
            <Button
              asChild
              size="sm"
              variant={activeTab === "overview" ? "default" : "ghost"}
            >
              <Link href={`/sport-center-management/${centerId}`}>
                {t("managementDetail.tabs.overview")}
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant={activeTab === "courts" ? "default" : "ghost"}
            >
              <Link href={`/sport-center-management/${centerId}?tab=courts`}>
                {t("managementDetail.tabs.courts")}
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant={activeTab === "price-slots" ? "default" : "ghost"}
            >
              <Link
                href={`/sport-center-management/${centerId}?tab=price-slots`}
              >
                {t("managementDetail.tabs.priceSlots")}
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant={activeTab === "policy" ? "default" : "ghost"}
            >
              <Link href={`/sport-center-management/${centerId}?tab=policy`}>
                {t("managementDetail.tabs.policy")}
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant={activeTab === "inventory" ? "default" : "ghost"}
            >
              <Link href={`/sport-center-management/${centerId}?tab=inventory`}>
                {t("managementDetail.tabs.inventory")}
              </Link>
            </Button>
          </div>

          {activeTab === "courts" ? (
            <CourtManagementPanel
              centerId={centerId}
              initialCourts={data.courts}
            />
          ) : activeTab === "price-slots" ? (
            <CenterPricingPolicyPanel
              centerId={centerId}
              section="price-slots"
              initialPriceSlots={data.priceSlots}
              initialPolicy={data.policy}
            />
          ) : activeTab === "policy" ? (
            <CenterPricingPolicyPanel
              centerId={centerId}
              section="policy"
              initialPriceSlots={data.priceSlots}
              initialPolicy={data.policy}
            />
          ) : activeTab === "inventory" ? (
            <ServicesProductsManagementPage
              key={centerId}
              lockedCenterId={centerId}
              lockedCenterActive={data.center.status === "ACTIVE"}
            />
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("createCenter.review.center")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <p className="font-medium">{data.center.name}</p>
                    <p className="text-muted-foreground">
                      {data.center.address}
                    </p>
                    <p>
                      {t("managementDetail.overview.phone")}:{" "}
                      {data.center.phone}
                    </p>
                    <p>
                      {t("managementDetail.overview.email")}:{" "}
                      {data.center.email || t("common.notAvailable")}
                    </p>
                    <p className="text-muted-foreground">
                      {data.center.description ||
                        t("managementDetail.overview.noDescription")}
                    </p>
                    <p>
                      {data.center.openTime} - {data.center.closeTime}
                    </p>
                    <p>
                      {t("managementDetail.overview.basePrice")}:{" "}
                      {data.center.basePrice}
                    </p>
                    <Badge
                      variant={
                        data.center.status === "ACTIVE"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {t(
                        `centerList.status.${data.center.status.toLowerCase()}`
                      )}
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t("createCenter.review.pricing")}</CardTitle>
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
                    <CardTitle>{t("createCenter.review.courts")}</CardTitle>
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
                    <CardTitle>{t("createCenter.review.services")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <p>
                      {data.services.length} / {data.products.length}
                    </p>
                    <p className="text-muted-foreground">
                      {t("createCenter.review.policy")}:{" "}
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
                    <CardTitle>{t("createCenter.review.courts")}</CardTitle>
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
                    <CardTitle>{t("createCenter.review.policy")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm">
                      {t("createCenter.fields.allowCancellation")}:{" "}
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
                      {t("managementDetail.overview.amenities")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {cleanList(data.center.amenities).length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        {t("managementDetail.overview.noAmenities")}
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {cleanList(data.center.amenities).map((amenity) => (
                          <Badge key={amenity} variant="secondary">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>
                      {t("managementDetail.overview.rules")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {cleanList(data.center.rules).length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        {t("managementDetail.overview.noRules")}
                      </p>
                    ) : (
                      <ol className="list-decimal space-y-2 pl-5 text-sm">
                        {cleanList(data.center.rules).map((rule) => (
                          <li key={rule}>{rule}</li>
                        ))}
                      </ol>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {t("managementDetail.overview.images")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {cleanList(data.center.images).length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        {t("managementDetail.overview.noImages")}
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {cleanList(data.center.images).map((image) => (
                          <FallbackImage
                            key={image}
                            src={image}
                            alt={t("managementDetail.overview.imageAlt", {
                              name: data.center.name,
                            })}
                            className="aspect-video w-full rounded-xl object-cover"
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>
                      {t("managementDetail.overview.payment")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">
                        {t("managementDetail.overview.accountName")}:
                      </span>{" "}
                      {data.center.paymentAccountName ||
                        t("common.notAvailable")}
                    </p>
                    <p>
                      <span className="font-medium">
                        {t("managementDetail.overview.accountNumber")}:
                      </span>{" "}
                      {data.center.paymentAccountNumber ||
                        t("common.notAvailable")}
                    </p>
                    <p>
                      <span className="font-medium">
                        {t("managementDetail.overview.bankName")}:
                      </span>{" "}
                      {data.center.paymentBankName || t("common.notAvailable")}
                    </p>
                    {data.center.paymentQrUrl ? (
                      <FallbackImage
                        src={data.center.paymentQrUrl}
                        alt={t("managementDetail.overview.qrAlt")}
                        className="mt-3 size-32 rounded-xl object-cover"
                      />
                    ) : (
                      <p className="text-muted-foreground">
                        {t("managementDetail.overview.noQr")}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {t("managementDetail.overview.statistics")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-muted-foreground">
                      {t("managementDetail.overview.courtsCount")}
                    </p>
                    <p className="text-xl font-semibold">
                      {data.center._count?.courts ?? data.courts.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">
                      {t("managementDetail.overview.averageRating")}
                    </p>
                    <p className="text-xl font-semibold">
                      {data.center.averageRating ?? t("common.notAvailable")}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">
                      {t("managementDetail.overview.reviewCount")}
                    </p>
                    <p className="text-xl font-semibold">
                      {data.center.reviewCount ?? 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">
                      {t("managementDetail.overview.updatedAt")}
                    </p>
                    <p className="font-medium">
                      {new Intl.DateTimeFormat(
                        typeof navigator === "undefined"
                          ? "en-US"
                          : navigator.language,
                        { dateStyle: "medium" }
                      ).format(new Date(data.center.updatedAt))}
                    </p>
                    <p className="mt-2 text-muted-foreground">
                      {t("managementDetail.overview.createdAt")}:{" "}
                      {new Intl.DateTimeFormat(
                        typeof navigator === "undefined"
                          ? "en-US"
                          : navigator.language,
                        { dateStyle: "medium" }
                      ).format(new Date(data.center.createdAt))}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 xl:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("createCenter.review.services")}</CardTitle>
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
                    <CardTitle>{t("createCenter.review.products")}</CardTitle>
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
      ) : (
        <Card>
          <CardContent className="p-6 text-sm text-destructive">
            {t("createCenter.detail.loadError")}
          </CardContent>
        </Card>
      )}
    </PageContainer>
  )
}
