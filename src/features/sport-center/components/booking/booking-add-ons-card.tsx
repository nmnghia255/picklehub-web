"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useBookingStore } from "@/features/sport-center/stores/booking-store"

export function BookingServicesCard() {
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
    <Card className="space-y-0">
      <CardHeader>
        <CardTitle className="text-lg">Dịch vụ và sản phẩm</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground">Dịch vụ</h3>
        {services.length === 0 ? (
          <p className="text-sm text-muted-foreground">Không có dịch vụ.</p>
        ) : (
          services.map((service) => (
            <label
              key={service.id}
              htmlFor={service.id}
              className="flex cursor-pointer items-center justify-between rounded-md border p-3"
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
                  <span className="text-sm font-medium">{service.name}</span>
                </div>
                {service.description && (
                  <span className="mt-1 text-xs text-muted-foreground">
                    {service.description}
                  </span>
                )}
              </div>
              <span className="text-sm font-medium">+{service.price} VND</span>
            </label>
          ))
        )}

        <div className="pt-2">
          <h3 className="text-sm font-semibold text-muted-foreground">
            Sản phẩm
          </h3>
          {products.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Không có sản phẩm.
            </p>
          ) : (
            <div className="mt-2 space-y-3">
              {products.map((product) => {
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
                        Tồn kho: {product.stock}
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
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
