import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

import type { SportCenterStatus } from "../../types/sport-center"
import type {
  CenterDraft,
  CourtDraft,
  PolicyDraft,
  PriceSlotDraft,
  ProductDraft,
  ServiceDraft,
} from "./types"

export function Step6Review({
  centerSnapshot,
  centerDraft,
  priceSlots,
  policy,
  courtDrafts,
  serviceDrafts,
  productDrafts,
}: {
  centerSnapshot: {
    id: string
    name: string
    address: string
    openTime: string
    closeTime: string
    basePrice: number
    paymentAccountName: string
    paymentAccountNumber: string
    paymentBankName: string
    paymentQrUrl?: string | null
    images?: string[]
    amenities?: string[]
    rules?: string[]
    description?: string | null
    status?: SportCenterStatus
  } | null
  centerDraft: CenterDraft
  priceSlots: PriceSlotDraft[]
  policy: PolicyDraft
  courtDrafts: CourtDraft[]
  serviceDrafts: ServiceDraft[]
  productDrafts: ProductDraft[]
}) {
  const { t } = useSportCenterManagementTranslation()

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Center Information */}
        <Card className="gap-0 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              {t("createCenter.review.center", {
                defaultValue: "Center",
              })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-xs">
            <p className="text-sm font-medium text-foreground">
              {centerSnapshot?.name ?? centerDraft.name}
            </p>
            <p className="text-muted-foreground">
              {centerSnapshot?.address ?? centerDraft.address}
            </p>
            <p>
              {centerSnapshot?.openTime ?? centerDraft.openTime} -{" "}
              {centerSnapshot?.closeTime ?? centerDraft.closeTime}
            </p>
            <p className="text-muted-foreground">
              {t("createCenter.statusLabel", {
                defaultValue: "Status",
              })}
              :{" "}
              <span className="font-semibold text-emerald-600">
                {t("createCenter.status.active", {
                  defaultValue: "Active",
                })}
              </span>
            </p>
            <div className="border-t pt-1.5 text-muted-foreground">
              <p>
                {centerSnapshot?.paymentBankName ?? centerDraft.paymentBankName}
              </p>
              <p>
                {centerSnapshot?.paymentAccountName ??
                  centerDraft.paymentAccountName}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Price slots */}
        <Card className="gap-0 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              {t("createCenter.review.pricing", {
                defaultValue: "Price slots",
              })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-xs">
            {priceSlots.map((slot) => (
              <div
                key={slot.id}
                className="flex items-center justify-between border-b pb-1 last:border-0 last:pb-0"
              >
                <span>
                  {slot.startTime} - {slot.endTime}
                </span>
                <span className="font-mono font-medium">
                  {Number(slot.pricePerHour).toLocaleString("vi-VN")} VND
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Policy */}
        <Card className="gap-0 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              {t("createCenter.review.policy", {
                defaultValue: "Cancellation policy",
              })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-xs">
            <p className="font-medium">
              {t("createCenter.fields.allowCancellation", {
                defaultValue: "Allow cancellation",
              })}
              : {policy.allowCancellation ? t("common.yes") : t("common.no")}
            </p>
            {policy.tiers.map((tier) => (
              <div
                key={tier.id}
                className="flex items-center justify-between border-b pb-1 last:border-0 last:pb-0"
              >
                <span>
                  {t("createCenter.review.daysPrior", {
                    days: tier.minDaysBeforeStart,
                    defaultValue: `${tier.minDaysBeforeStart} days prior`,
                  })}
                </span>
                <span className="font-medium text-emerald-600">
                  {t("createCenter.review.refundPercent", {
                    percent: tier.refundPercent,
                    defaultValue: `${tier.refundPercent}% refund`,
                  })}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Courts */}
        <Card className="gap-0 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              {t("createCenter.review.courts", {
                defaultValue: "Courts",
              })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-xs">
            {courtDrafts.length === 0 ? (
              <p className="text-muted-foreground">
                {t("createCenter.review.skippedCourts", {
                  defaultValue: "Courts will be configured later.",
                })}
              </p>
            ) : (
              courtDrafts.map((court) => (
                <div
                  key={court.id}
                  className="flex items-center justify-between border-b pb-1 last:border-0 last:pb-0"
                >
                  <span className="font-medium">{court.name}</span>
                  <span className="text-muted-foreground">
                    {t(`courtManagement.types.${court.type}`, {
                      defaultValue: court.type,
                    })}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Services */}
        <Card className="gap-0 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              {t("createCenter.review.services", {
                defaultValue: "Services",
              })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-xs">
            {serviceDrafts.length === 0 ? (
              <p className="text-muted-foreground">
                {t("createCenter.review.skippedInventory", {
                  defaultValue: "Services will be configured later.",
                })}
              </p>
            ) : (
              serviceDrafts.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between border-b pb-1 last:border-0 last:pb-0"
                >
                  <span className="font-medium">{service.name}</span>
                  <span className="font-mono">
                    {Number(service.price).toLocaleString("vi-VN")} VND
                    {service.unit ? ` / ${service.unit}` : ""}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Products */}
        <Card className="gap-0 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              {t("createCenter.review.products", {
                defaultValue: "Products",
              })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-xs">
            {productDrafts.length === 0 ? (
              <p className="text-muted-foreground">
                {t("createCenter.review.skippedInventory", {
                  defaultValue: "Products will be configured later.",
                })}
              </p>
            ) : (
              productDrafts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between border-b pb-1 last:border-0 last:pb-0"
                >
                  <span className="font-medium">{product.name}</span>
                  <span className="font-mono">
                    {Number(product.price).toLocaleString("vi-VN")} VND
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Alert variant="default" className="border-primary/20 bg-primary/5">
        <AlertTitle className="font-semibold text-primary">
          {t("createCenter.review.noteTitle", {
            defaultValue: "Review before finishing",
          })}
        </AlertTitle>
        <AlertDescription className="text-xs text-muted-foreground">
          {t("createCenter.review.note", {
            defaultValue:
              "The wizard will sync the latest server state before navigating to the management detail page.",
          })}
        </AlertDescription>
      </Alert>
    </div>
  )
}
