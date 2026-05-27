import { Card, CardContent } from "@/components/ui/card"
import { getSportCenterPriceSlots } from "@/features/sport-center/api/sport-center-user-service"
import { ProductCard } from "@/features/sport-center/components/sport-center-detail/product-card"
import { ServiceCard } from "@/features/sport-center/components/sport-center-detail/service-card"
import type {
  PriceSlot,
  SportCenter,
} from "@/features/sport-center/types/sport-center"
import { formatCurrencyVnd } from "@/utils/expense-utils"

interface ServiceTabProps {
  sportCenterId: string
  sportCenterName: string
  products: SportCenter["products"]
  services: SportCenter["services"]
}

export async function ServiceTab({
  sportCenterId,
  sportCenterName,
  products,
  services,
}: ServiceTabProps) {
  let priceSlots: PriceSlot[] = []

  try {
    priceSlots = await getSportCenterPriceSlots(sportCenterId)
  } catch (error) {
    console.error("Failed to fetch sport center price slots:", error)
  }

  return (
    <Card className="gap-0 py-0">
      <CardContent className="space-y-6 p-6">
        {/* Price Slots */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Bảng giá</h2>
            <span className="text-xs text-muted-foreground">
              {priceSlots.length} khung giờ
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
                        {formatCurrencyVnd(slot.pricePerHour)} / giờ
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Áp dụng cho {sportCenterName}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Chưa có bảng giá.</p>
            )}
          </section>
        </div>

        {/* Products */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Sản phẩm</h2>
            <span className="text-xs text-muted-foreground">
              {products.length} mục
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
                  Chưa có sản phẩm.
                </p>
              )}
            </div>
          </section>
        </div>

        {/* Services */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Dịch vụ</h2>
            <span className="text-xs text-muted-foreground">
              {services.length} mục
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
                  Chưa có dịch vụ.
                </p>
              )}
            </div>
          </section>
        </div>
      </CardContent>
    </Card>
  )
}
