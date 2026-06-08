import { notFound } from "next/navigation"

import { PageContainer } from "@/components/page-container"
import { CourtService } from "@/features/sport-center/api/court-service"
import {
  getSportCenterById,
  getSportCenterPriceSlots,
  getSportCenterReviews,
} from "@/features/sport-center/api/sport-center-service"
import type { CourtResponse } from "@/features/sport-center/types/court"
import type { Review } from "@/features/sport-center/types/review"
import type {
  PriceSlot,
  SportCenter,
} from "@/features/sport-center/types/sport-center"

import { DetailTabs } from "../../../../features/sport-center/components/sport-center-detail/detail-tabs"
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
  let reviews: Review[] = []
  let priceSlots: PriceSlot[] = []

  try {
    sportCenter = await getSportCenterById(id)
  } catch (error) {
    console.error("Failed to fetch sport center details:", error)
    notFound()
  }

  if (!sportCenter) {
    notFound()
  }

  const [courtsResult, reviewsResult, priceSlotsResult] =
    await Promise.allSettled([
      CourtService.getCourts(id),
      getSportCenterReviews(id),
      getSportCenterPriceSlots(id),
    ])

  if (courtsResult.status === "fulfilled") {
    courts = courtsResult.value
  }

  if (reviewsResult.status === "fulfilled") {
    reviews = reviewsResult.value
  }

  if (priceSlotsResult.status === "fulfilled") {
    priceSlots = priceSlotsResult.value
  }

  return (
    <PageContainer variant="wide" className="space-y-6">
      <SportCenterHeaderCard sportCenter={sportCenter} />

      <DetailTabs
        introductionTab={
          <IntroductionTab
            description={sportCenter.description}
            courts={courts}
          />
        }
        serviceTab={
          <ServiceTab
            sportCenterId={id}
            sportCenterName={sportCenter.name}
            products={sportCenter.products}
            services={sportCenter.services}
            priceSlots={priceSlots}
          />
        }
        imagesTab={<ImagesTab images={sportCenter.images} />}
        policyTab={<PolicyTab rules={sportCenter.rules} />}
        feedbackTab={<FeedbackTab reviews={reviews} centerId={id} />}
      />
    </PageContainer>
  )
}
