"use client"

import { RefreshCw } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { PageContainer } from "@/components/page-container"
import { Button } from "@/components/ui/button"
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

export default function CustomerDetailPage() {
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
            : "Không thể tải chi tiết khách hàng"
        )
      })

    return () => {
      active = false
    }
  }, [customerId, reloadKey])

  const isLoading = Boolean(customerId) && !detail && !loadError
  const customerName = detail?.customer.name ?? "Đang tải khách hàng"

  const handleRetry = () => {
    setLoadError(null)
    setReloadKey((value) => value + 1)
  }

  return (
    <PageContainer variant="wide" className="space-y-6 py-6">
      <CustomerDetailPageHeader
        customerName={customerName}
        onBack={() =>
          router.push("/sport-center-management/customer-management")
        }
      />

      {!customerId ? (
        <CustomerDetailNoticeCard
          title="Không tìm thấy khách hàng"
          description="Mã khách hàng không hợp lệ hoặc bị thiếu trong đường dẫn."
        >
          <Button
            variant="outline"
            onClick={() =>
              router.push("/sport-center-management/customer-management")
            }
          >
            Quay lại danh sách
          </Button>
        </CustomerDetailNoticeCard>
      ) : null}

      {isLoading ? <CustomerDetailPageSkeleton /> : null}

      {!isLoading && customerId && loadError ? (
        <CustomerDetailNoticeCard
          title="Không thể tải chi tiết khách hàng"
          description={loadError}
        >
          <Button
            variant="outline"
            onClick={() =>
              router.push("/sport-center-management/customer-management")
            }
          >
            Quay lại danh sách
          </Button>
          <Button onClick={handleRetry}>
            <RefreshCw className="mr-2 size-4" />
            Thử lại
          </Button>
        </CustomerDetailNoticeCard>
      ) : null}

      {!isLoading && detail ? (
        <div className="space-y-6">
          <CustomerDetailProfileCard detail={detail} />
          <CustomerDetailSummaryGrid detail={detail} />
          <CustomerDetailBasicInfoSection detail={detail} />
          <CustomerDetailCenterSection centers={detail.byCenter} />
          <CustomerDetailBookingSection
            recentBookings={detail.recentBookings}
          />
        </div>
      ) : null}
    </PageContainer>
  )
}
