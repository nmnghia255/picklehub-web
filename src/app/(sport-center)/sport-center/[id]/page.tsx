"use client"

import { Clock3, Heart, Mail, MapPin, Phone, Star } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

import { PageContainer } from "@/components/page-container"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { sportCenterInfo } from "@/features/sport-center/mock-data/sport-center-info"
import { PublicCourtsTab } from "@/features/sport-center-management/courts/components/public-courts-tab"
import { ProductCard } from "@/features/sport-center-management/services-products/components/product-card"
import { ServiceCard } from "@/features/sport-center-management/services-products/components/service-card"
import { MOCK_COURT_INVENTORY } from "@/features/sport-center-management/services-products/mock-data"

export default function SportCenterInformationPage() {
  const params = useParams<{ id: string }>()
  const centerId = params?.id ?? ""
  return (
    <PageContainer variant="wide" className="space-y-6">
      <Card className="overflow-hidden py-0">
        <div className="h-48 w-full bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500" />
        <CardContent className="space-y-5 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <img
                src="https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&w=240&q=80"
                alt="Sport center logo"
                className="size-20 rounded-full border-4 border-background object-cover shadow-sm"
              />
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">
                  Pickle Dome Sukhumvit
                </h1>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Premium Partner</Badge>
                  <Badge variant="outline">8 sân</Badge>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href={`/booking`}>
                {/* TODO: Navigate to booking page with sport center ID */}
                <Button>Đặt sân</Button>
              </Link>
              <Button variant="outline">
                <Heart />
                {/* TODO: Implement favorite functionality */}
                Yêu thích
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 text-sm text-muted-foreground md:grid-cols-2">
            <p className="flex items-center gap-2">
              <MapPin className="size-4" />
              42 Sukhumvit 49, Watthana, Bangkok
            </p>
            <p className="flex items-center gap-2">
              <Clock3 className="size-4" />
              Giờ hoạt động: 06:00 - 23:00
            </p>
            <p className="flex items-center gap-2">
              <Phone className="size-4" />
              +66 2 111 2222
            </p>
            <p className="flex items-center gap-2">
              <Mail className="size-4" />
              hello@pickledome.com
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="introduction" className="w-full">
        <TabsList className="h-auto w-full flex-wrap justify-start">
          <TabsTrigger value="introduction">Giới thiệu</TabsTrigger>
          <TabsTrigger value="courts">Sân</TabsTrigger>
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
                {sportCenterInfo.introduction}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courts">
          <Card>
            <CardContent className="space-y-4 p-6">
              <div>
                <h2 className="text-lg font-semibold">Danh sách sân</h2>
                <p className="text-sm text-muted-foreground">
                  Xem các sân hiện có tại trung tâm này.
                </p>
              </div>

              <PublicCourtsTab centerId={centerId} />
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
                Dữ liệu mock hiển thị từ module quản trị (view-only).
              </p>

              <div className="space-y-8">
                <section className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-medium">Sản phẩm</h3>
                    <span className="text-xs text-muted-foreground">
                      {
                        MOCK_COURT_INVENTORY.flatMap((c) => c.products ?? [])
                          .length
                      }{" "}
                      mục
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {MOCK_COURT_INVENTORY.flatMap((c) => c.products ?? []).map(
                      (p) => (
                        <ProductCard key={p.id} item={p} />
                      )
                    )}
                  </div>
                </section>

                <section className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-medium">Dịch vụ</h3>
                    <span className="text-xs text-muted-foreground">
                      {
                        MOCK_COURT_INVENTORY.flatMap((c) => c.services ?? [])
                          .length
                      }{" "}
                      mục
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {MOCK_COURT_INVENTORY.flatMap((c) => c.services ?? []).map(
                      (s) => (
                        <ServiceCard key={s.id} item={s} />
                      )
                    )}
                  </div>
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
                {sportCenterInfo.images?.map((url, index) => (
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
                {sportCenterInfo.policies.map((item) => (
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
                {sportCenterInfo.feedback.map((entry) => (
                  <div key={entry.name} className="rounded-lg border p-4">
                    <div className="mb-1 flex items-center justify-between">
                      <p className="font-medium">{entry.name}</p>
                      <p className="flex items-center gap-1 text-sm">
                        <Star className="size-4 fill-current" />
                        {entry.rating}.0
                      </p>
                    </div>
                    <p className="mb-2 text-sm text-muted-foreground">
                      {entry.comment}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}
