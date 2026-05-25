import { Clock3, Heart, Mail, MapPin, Phone, Star } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

import { PageContainer } from "@/components/page-container"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getSportCenterById,
  getSportCenterCourts,
  getSportCenterPriceSlots,
  getSportCenterReviews,
} from "@/features/sport-center/api/sport-center-user-service"
import type { CourtResponse } from "@/features/sport-center/types/court"
import type { Review } from "@/features/sport-center/types/review"
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

type PageProps = {
  params: Promise<{ id: string }>
}

function formatPriceVnd(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
}

function getCourtTypeLabel(court: CourtResponse) {
  return court.type === "INDOOR" ? "Trong nhà" : "Ngoài trời"
}

function getCourtStatusLabel(court: CourtResponse) {
  return court.status === "ACTIVE" ? "Đang hoạt động" : "Tạm ngưng"
}

function mapProductToInventoryItem(
  product: SportCenter["products"][number],
  courtName: string
): ProductInventoryItem {
  return {
    kind: "product",
    id: product.id,
    courtId: product.centerId,
    courtName,
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
  courtName: string
): ServiceInventoryItem {
  return {
    kind: "service",
    id: service.id,
    courtId: service.centerId,
    courtName,
    name: service.name,
    category: service.type === "COACHING" ? "Huấn luyện" : "Cho thuê",
    price: service.price,
    status: service.isActive ? "active" : "paused",
    description: service.description,
    updatedAt: service.updatedAt,
  }
}

export default async function SportCenterInformationPage({
  params,
}: PageProps) {
  const { id } = await params

  let sportCenter: SportCenter | null = null
  let courts: CourtResponse[] = []
  let priceSlots: PriceSlot[] = []
  let reviews: Review[] = []

  try {
    sportCenter = await getSportCenterById(id)
  } catch (error) {
    console.error("Failed to fetch sport center details:", error)
    notFound()
  }

  if (!sportCenter) {
    notFound()
  }

  const [courtsResult, priceSlotsResult, reviewsResult] =
    await Promise.allSettled([
      getSportCenterCourts(id),
      getSportCenterPriceSlots(id),
      getSportCenterReviews(id),
    ])

  if (courtsResult.status === "fulfilled") {
    courts = courtsResult.value
  }

  if (priceSlotsResult.status === "fulfilled") {
    priceSlots = priceSlotsResult.value
  }

  if (reviewsResult.status === "fulfilled") {
    reviews = reviewsResult.value
  }

  const productInventoryItems = sportCenter.products.map((product) =>
    mapProductToInventoryItem(product, sportCenter.name)
  )

  const serviceInventoryItems = sportCenter.services.map((service) =>
    mapServiceToInventoryItem(service, sportCenter.name)
  )

  return (
    <PageContainer variant="wide" className="space-y-6">
      <Card className="overflow-hidden py-0">
        <div className="h-48 w-full bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500" />
        <CardContent className="space-y-5 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <img
                src={
                  sportCenter.images[0] ??
                  "https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&w=240&q=80"
                }
                alt={`${sportCenter.name} logo`}
                className="size-20 rounded-full border-4 border-background object-cover shadow-sm"
              />
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">
                  {sportCenter.name}
                </h1>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {sportCenter.status === "ACTIVE"
                      ? "Đang hoạt động"
                      : "Tạm ngưng"}
                  </Badge>
                  <Badge variant="outline">
                    {sportCenter._count.courts} sân
                  </Badge>
                  <Badge variant="outline">
                    {sportCenter.averageRating.toFixed(1)} sao
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href={`/booking?centerId=${sportCenter.id}`}>
                <Button>Đặt sân</Button>
              </Link>
              <Button variant="outline">
                <Heart />
                {sportCenter.isFavourite ? "Đã yêu thích" : "Yêu thích"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 text-sm text-muted-foreground md:grid-cols-2">
            <p className="flex items-center gap-2">
              <MapPin className="size-4" />
              {sportCenter.address}
            </p>
            <p className="flex items-center gap-2">
              <Clock3 className="size-4" />
              Giờ hoạt động: {sportCenter.openTime} - {sportCenter.closeTime}
            </p>
            <p className="flex items-center gap-2">
              <Phone className="size-4" />
              {sportCenter.phone}
            </p>
            <p className="flex items-center gap-2">
              <Mail className="size-4" />
              {sportCenter.email}
            </p>
          </div>

          {sportCenter.amenities.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {sportCenter.amenities.map((amenity) => (
                <Badge key={amenity} variant="outline">
                  {amenity}
                </Badge>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Tabs defaultValue="introduction" className="w-full">
        <TabsList className="h-auto w-full flex-wrap justify-start">
          <TabsTrigger value="introduction">Giới thiệu</TabsTrigger>
          <TabsTrigger value="service">Dịch vụ</TabsTrigger>
          <TabsTrigger value="images">Hình ảnh</TabsTrigger>
          <TabsTrigger value="policy">Điều khoản & quy định</TabsTrigger>
          <TabsTrigger value="feedback">Đánh giá</TabsTrigger>
        </TabsList>

        <TabsContent value="introduction">
          <Card>
            <CardContent className="space-y-3 p-6">
              <h2 className="text-lg font-semibold">Giới thiệu</h2>
              <p className="text-sm text-muted-foreground">
                {sportCenter.description}
              </p>

              <div className="space-y-3 pt-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-medium">Danh sách sân</h3>
                  <span className="text-xs text-muted-foreground">
                    {courts.length} sân
                  </span>
                </div>

                {courts.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {courts.map((court) => (
                      <Badge key={court.id} variant="outline">
                        {court.name} · {getCourtTypeLabel(court)} ·{" "}
                        {getCourtStatusLabel(court)}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Chưa có thông tin sân.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="service">
          <Card>
            <CardContent className="space-y-4 p-6">
              <h2 className="text-lg font-semibold">
                Dịch vụ & Sản phẩm (xem)
              </h2>

              <p className="text-sm text-muted-foreground">
                Dữ liệu được đồng bộ trực tiếp từ API trung tâm sân.
              </p>

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
                            Áp dụng cho {sportCenter.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Chưa có bảng giá.
                    </p>
                  )}
                </section>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images">
          <Card>
            <CardContent className="space-y-4 p-6">
              <h2 className="text-lg font-semibold">Hình ảnh</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {sportCenter.images.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Sport center image ${index + 1}`}
                    className="h-44 w-full rounded-lg object-cover"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policy">
          <Card>
            <CardContent className="space-y-3 p-6">
              <h2 className="text-lg font-semibold">Điều khoản & quy định</h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {sportCenter.rules.map((item) => (
                  <li key={item} className="rounded-lg border px-3 py-2">
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback">
          <Card>
            <CardContent className="space-y-4 p-6">
              <h2 className="text-lg font-semibold">Đánh giá</h2>
              <div className="space-y-3">
                {reviews.length > 0 ? (
                  reviews.map((entry) => (
                    <div key={entry.id} className="rounded-lg border p-4">
                      <div className="mb-1 flex items-center justify-between">
                        <p className="font-medium">
                          Người dùng {entry.userId.slice(0, 8)}
                        </p>
                        <p className="flex items-center gap-1 text-sm">
                          <Star className="size-4 fill-current" />
                          {entry.rating.toFixed(1)}
                        </p>
                      </div>
                      <p className="mb-2 text-sm text-muted-foreground">
                        {entry.comment}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Chưa có đánh giá nào.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}
