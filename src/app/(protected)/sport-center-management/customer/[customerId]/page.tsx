"use client"

import { RefreshCw } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { PageContainer } from "@/components/page-container"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CustomerService } from "@/features/sport-center-management/api/customer-service"
import { CustomerDetailBasicInfoSection } from "@/features/sport-center-management/components/customer/customer-detail/customer-detail-basic-info-section"
import { CustomerDetailBookingSection } from "@/features/sport-center-management/components/customer/customer-detail/customer-detail-booking-section"
import { CustomerDetailCenterSection } from "@/features/sport-center-management/components/customer/customer-detail/customer-detail-center-section"
import { CustomerDetailNoticeCard } from "@/features/sport-center-management/components/customer/customer-detail/customer-detail-notice-card"
import { CustomerDetailPageHeader } from "@/features/sport-center-management/components/customer/customer-detail/customer-detail-page-header"
import { CustomerDetailPageSkeleton } from "@/features/sport-center-management/components/customer/customer-detail/customer-detail-page-skeleton"
import { CustomerDetailProfileCard } from "@/features/sport-center-management/components/customer/customer-detail/customer-detail-profile-card"
import { CustomerDetailSummaryGrid } from "@/features/sport-center-management/components/customer/customer-detail/customer-detail-summary-grid"
import type { CustomerDetailResponse } from "@/features/sport-center-management/types/customer"
import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

export default function CustomerDetailPage() {
  const { t } = useSportCenterManagementTranslation()
  const router = useRouter()
  const params = useParams<{ customerId?: string | string[] }>()
  const customerId = Array.isArray(params.customerId)
    ? params.customerId[0]
    : params.customerId

  const [detail, setDetail] = useState<CustomerDetailResponse | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!customerId) return

    let active = true

    void CustomerService.getCustomerDetail(customerId)
      .then((response) => {
        if (!active) return
        setDetail(response)
      })
      .catch((error) => {
        if (!active) return
        setLoadError(
          error instanceof Error
            ? error.message
            : t("customer.detail.page.loadError")
        )
      })

    return () => {
      active = false
    }
  }, [customerId, reloadKey])

  const isLoading = Boolean(customerId) && !detail && !loadError
  const customerName =
    detail?.customer.name ?? t("customer.detail.page.loading")

  const handleRetry = () => {
    setLoadError(null)
    setReloadKey((value) => value + 1)
  }

  return (
    <PageContainer
      variant="wide"
      className="space-y-4 py-4 text-[15px] md:space-y-5 md:py-6 md:text-base"
    >
      <CustomerDetailPageHeader
        customerName={customerName}
        onBack={() => router.back()}
      />

      {!customerId ? (
        <CustomerDetailNoticeCard
          title={t("customer.detail.page.notFoundTitle")}
          description={t("customer.detail.page.notFoundDescription")}
        >
          <Button variant="outline" onClick={() => router.back()}>
            {t("common.back")}
          </Button>
        </CustomerDetailNoticeCard>
      ) : null}

      {isLoading ? <CustomerDetailPageSkeleton /> : null}

      {!isLoading && customerId && loadError ? (
        <CustomerDetailNoticeCard
          title={t("customer.detail.page.loadErrorTitle")}
          description={loadError}
        >
          <Button
            variant="outline"
            onClick={() =>
              router.push("/sport-center-management/customer-management")
            }
          >
            {t("common.back")}
          </Button>
          <Button onClick={handleRetry}>
            <RefreshCw className="mr-2 size-4" />
            {t("customer.detail.page.retry")}
          </Button>
        </CustomerDetailNoticeCard>
      ) : null}

      {!isLoading && detail ? (
        <div className="space-y-6">
          <CustomerDetailProfileCard detail={detail} />
          <Separator />
          <CustomerDetailSummaryGrid detail={detail} />
          <Separator />
          <CustomerDetailBasicInfoSection detail={detail} />
          <Separator />
          <CustomerDetailCenterSection centers={detail.byCenter} />
          <Separator />
          <CustomerDetailBookingSection
            recentBookings={detail.recentBookings}
          />
        </div>
      ) : null}
    </PageContainer>
  )
}
