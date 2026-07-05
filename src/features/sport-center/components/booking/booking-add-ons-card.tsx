"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useBookingStore } from "@/features/sport-center/stores/booking-store"
import { useSportCenterTranslation } from "@/i18n/use-sport-center-translation"
import { formatCurrencyVnd } from "@/utils/expense-utils"

export function BookingServicesCard() {
  const { t } = useSportCenterTranslation()
  const services = useBookingStore((state) => state.services)
  const products = useBookingStore((state) => state.products)
  const selectedServices = useBookingStore((state) => state.selectedServices)
  const selectedProducts = useBookingStore((state) => state.selectedProducts)
  const onSetSelectedServices = useBookingStore(
    (state) => state.setSelectedServices
  )
  const onSetSelectedProducts = useBookingStore(
    (state) => state.setSelectedProducts
  )

  return (
    <Card className="gap-4 space-y-0">
      <CardHeader>
        <CardTitle className="text-lg">{t("booking.addOns.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Services Column */}
          <div className="space-y-3">
            <h3 className="pb-1 text-sm font-semibold text-muted-foreground">
              {t("booking.addOns.services")}
            </h3>
            <div className="space-y-3">
              {services.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("booking.addOns.noServices")}
                </p>
              ) : (
                services.map((service) => (
                  <label
                    key={service.id}
                    htmlFor={service.id}
                    className="flex cursor-pointer items-center justify-between rounded-md border p-3 transition-colors hover:bg-muted/10"
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id={service.id}
                          checked={selectedServices[service.id]}
                          onCheckedChange={(checked) => {
                            onSetSelectedServices((prev) => ({
                              ...prev,
                              [service.id]: checked === true,
                            }))
                          }}
                        />
                        <span className="text-sm font-medium">
                          {service.name}
                        </span>
                      </div>
                      {service.description && (
                        <span className="mt-1 pl-7 text-xs text-muted-foreground">
                          {service.description}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      + {formatCurrencyVnd(service.price)}
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Products Column */}
          <div className="space-y-3">
            <h3 className="pb-1 text-sm font-semibold text-muted-foreground">
              {t("booking.addOns.products")}
            </h3>
            <div className="space-y-3">
              {products.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("booking.addOns.noProducts")}
                </p>
              ) : (
                products.map((product) => {
                  const quantity = selectedProducts[product.id] ?? 0
                  const canIncrease = quantity < product.stock

                  return (
                    <div
                      key={product.id}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{product.name}</p>
                        {product.description && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {product.description}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-muted-foreground">
                          {t("booking.addOns.stock", { count: product.stock })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={quantity <= 0}
                          onClick={() => {
                            onSetSelectedProducts((prev) => ({
                              ...prev,
                              [product.id]: Math.max(
                                (prev[product.id] ?? 0) - 1,
                                0
                              ),
                            }))
                          }}
                        >
                          -
                        </Button>
                        <span className="min-w-7 text-center text-sm font-medium">
                          {quantity}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={!canIncrease}
                          onClick={() => {
                            onSetSelectedProducts((prev) => ({
                              ...prev,
                              [product.id]: Math.min(
                                (prev[product.id] ?? 0) + 1,
                                product.stock
                              ),
                            }))
                          }}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
