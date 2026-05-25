import { notFound } from "next/navigation"

import { PageContainer } from "@/components/page-container"
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

import { FeedbackTab } from "../../../../features/sport-center/components/sport-center-detail/feedback-tab"
import { ImagesTab } from "../../../../features/sport-center/components/sport-center-detail/images-tab"
import { IntroductionTab } from "../../../../features/sport-center/components/sport-center-detail/introduction-tab"
import { PolicyTab } from "../../../../features/sport-center/components/sport-center-detail/policy-tab"
import { ServiceTab } from "../../../../features/sport-center/components/sport-center-detail/service-tab"
import { SportCenterHeaderCard } from "../../../../features/sport-center/components/sport-center-detail/sport-center-header-card"

type PageProps = {
  params: Promise<{ id: string }>
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

  return (
    <PageContainer variant="wide" className="space-y-6">
      <SportCenterHeaderCard sportCenter={sportCenter} />

      <Tabs defaultValue="introduction" className="w-full">
        <TabsList className="h-auto w-full flex-wrap justify-start">
          <TabsTrigger value="introduction">Giới thiệu</TabsTrigger>
          <TabsTrigger value="service">Dịch vụ</TabsTrigger>
          <TabsTrigger value="images">Hình ảnh</TabsTrigger>
          <TabsTrigger value="policy">Điều khoản & quy định</TabsTrigger>
          <TabsTrigger value="feedback">Đánh giá</TabsTrigger>
        </TabsList>

        <TabsContent value="introduction">
          <IntroductionTab
            description={sportCenter.description}
            courts={courts}
          />
        </TabsContent>

        <TabsContent value="service">
          <ServiceTab
            sportCenterName={sportCenter.name}
            products={sportCenter.products}
            services={sportCenter.services}
            priceSlots={priceSlots}
          />
        </TabsContent>

        <TabsContent value="images">
          <ImagesTab images={sportCenter.images} />
        </TabsContent>

        <TabsContent value="policy">
          <PolicyTab rules={sportCenter.rules} />
        </TabsContent>

        <TabsContent value="feedback">
          <FeedbackTab reviews={reviews} />
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}
