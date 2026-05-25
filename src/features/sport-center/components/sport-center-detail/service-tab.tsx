import { Card, CardContent } from "@/components/ui/card"
import type {
  PriceSlot,
  SportCenter,
} from "@/features/sport-center/types/sport-center"
import { ProductCard } from "@/features/sport-center-management/services-products/components/product-card"
import { ServiceCard } from "@/features/sport-center-management/services-products/components/service-card"
import type {
  ProductInventoryItem,
  ServiceInventoryItem,
} from "@/features/sport-center-management/services-products/types"

interface ServiceTabProps {
  sportCenterName: string
  products: SportCenter["products"]
  services: SportCenter["services"]
  priceSlots: PriceSlot[]
}

function formatPriceVnd(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
}

function mapProductToInventoryItem(
  product: SportCenter["products"][number],
  sportCenterName: string
): ProductInventoryItem {
  return {
    kind: "product",
    id: product.id,
    courtId: product.centerId,
    courtName: sportCenterName,
    name: product.name,
    category: "Đồ uống",
    price: product.price,
    stock: product.stock,
    status: product.isActive && product.stock > 0 ? "in_stock" : "out_of_stock",
    description: product.description,
    imageUrl: product.imageUrl,
    updatedAt: product.updatedAt,
  }
}

function mapServiceToInventoryItem(
  service: SportCenter["services"][number],
  sportCenterName: string
): ServiceInventoryItem {
  return {
    kind: "service",
    id: service.id,
    courtId: service.centerId,
    courtName: sportCenterName,
    name: service.name,
    category: service.type === "COACHING" ? "Huấn luyện" : "Cho thuê",
    price: service.price,
    status: service.isActive ? "active" : "paused",
    description: service.description,
    updatedAt: service.updatedAt,
  }
}

export function ServiceTab({
  sportCenterName,
  products,
  services,
  priceSlots,
}: ServiceTabProps) {
  const productInventoryItems = products.map((product) =>
    mapProductToInventoryItem(product, sportCenterName)
  )

  const serviceInventoryItems = services.map((service) =>
    mapServiceToInventoryItem(service, sportCenterName)
  )

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <h2 className="text-lg font-semibold">Dịch vụ & Sản phẩm</h2>

        <div className="space-y-8">
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-medium">Sản phẩm</h3>
              <span className="text-xs text-muted-foreground">
                {productInventoryItems.length} mục
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {productInventoryItems.length > 0 ? (
                productInventoryItems.map((item) => (
                  <ProductCard key={item.id} item={item} />
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Chưa có sản phẩm.
                </p>
              )}
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-medium">Dịch vụ</h3>
              <span className="text-xs text-muted-foreground">
                {serviceInventoryItems.length} mục
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {serviceInventoryItems.length > 0 ? (
                serviceInventoryItems.map((item) => (
                  <ServiceCard key={item.id} item={item} />
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Chưa có dịch vụ.
                </p>
              )}
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-medium">Bảng giá</h3>
              <span className="text-xs text-muted-foreground">
                {priceSlots.length} khung giờ
              </span>
            </div>

            {priceSlots.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {priceSlots.map((slot) => (
                  <div key={slot.id} className="rounded-lg border p-4">
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <p className="font-medium">
                        {slot.startTime} - {slot.endTime}
                      </p>
                      <p className="text-sm font-semibold">
                        {formatPriceVnd(slot.pricePerHour)} / giờ
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
      </CardContent>
    </Card>
  )
}
