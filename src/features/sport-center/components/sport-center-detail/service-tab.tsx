"use client"

import { Card, CardContent } from "@/components/ui/card"
import { getSportCenterPriceSlots } from "@/features/sport-center/api/sport-center-service"
import { ProductCard } from "@/features/sport-center/components/sport-center-detail/product-card"
import { ServiceCard } from "@/features/sport-center/components/sport-center-detail/service-card"
import type {
  PriceSlot,
  SportCenter,
} from "@/features/sport-center/types/sport-center"
import { useSportCenterTranslation } from "@/i18n/use-sport-center-translation"
import { formatCurrencyVnd } from "@/utils/expense-utils"

interface ServiceTabProps {
  sportCenterId: string
  sportCenterName: string
  products: SportCenter["products"]
  services: SportCenter["services"]
  priceSlots: PriceSlot[]
}

export function ServiceTab({
  sportCenterId,
  sportCenterName,
  products,
  services,
  priceSlots,
}: ServiceTabProps) {
  const { t } = useSportCenterTranslation()

  return (
    <Card className="gap-0 py-0">
      <CardContent className="space-y-6 p-6">
        {/* Price Slots */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">
              {t("detail.service.priceTable")}
            </h2>
            <span className="text-xs text-muted-foreground">
              {t("detail.service.priceSlotsCount", {
                count: priceSlots.length,
              })}
            </span>
          </div>
          <section className="space-y-3">
            {priceSlots.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {priceSlots.map((slot) => (
                  <div key={slot.id} className="rounded-lg border p-4">
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <p className="font-medium">
                        {slot.startTime} - {slot.endTime}
                      </p>
                      <p className="text-sm font-semibold">
                        {formatCurrencyVnd(slot.pricePerHour)}
                        {t("detail.service.perHour")}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t("detail.service.appliedFor", {
                        name: sportCenterName,
                      })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t("detail.service.noPriceTable")}
              </p>
            )}
          </section>
        </div>

        {/* Products */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">
              {t("detail.service.products")}
            </h2>
            <span className="text-xs text-muted-foreground">
              {t("detail.service.itemsCount", { count: products.length })}
            </span>
          </div>

          <section className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {products.length > 0 ? (
                products.map((item) => (
                  <ProductCard key={item.id} item={item} />
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t("detail.service.noProducts")}
                </p>
              )}
            </div>
          </section>
        </div>

        {/* Services */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">
              {t("detail.service.services")}
            </h2>
            <span className="text-xs text-muted-foreground">
              {t("detail.service.itemsCount", { count: services.length })}
            </span>
          </div>

          <section className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {services.length > 0 ? (
                services.map((item) => (
                  <ServiceCard key={item.id} item={item} />
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t("detail.service.noServices")}
                </p>
              )}
            </div>
          </section>
        </div>
      </CardContent>
    </Card>
  )
}
