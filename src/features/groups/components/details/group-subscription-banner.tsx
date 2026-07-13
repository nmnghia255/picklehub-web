"use client"

import { AlertTriangle, CreditCard } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo } from "react"

import { Button } from "@/components/ui/button"
import type { Group } from "@/features/groups/types"
import { useGroupsTranslation } from "@/i18n/use-groups-translation"

interface GroupSubscriptionBannerProps {
  group: Group
  currentUserRole?: string | null
}

export function GroupSubscriptionBanner({
  group,
  currentUserRole,
}: GroupSubscriptionBannerProps) {
  const { t } = useGroupsTranslation()
  const router = useRouter()

  const normalizedRole = currentUserRole?.toLowerCase()
  const canManage = normalizedRole === "owner" || normalizedRole === "admin"

  const bannerData = useMemo(() => {
    const sub = group.subscription
    if (!sub) return null

    const expiresAt = sub.expiresAt
    if (!expiresAt) return null

    const expiresDate = new Date(expiresAt)
    const now = new Date()
    const diffTime = expiresDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    const isExpired = diffDays <= 0 || !sub.hasAccess

    if (isExpired) {
      return {
        type: "expired" as const,
        days: 0,
      }
    }

    if (diffDays > 0 && diffDays <= 3) {
      return {
        type: "expiring" as const,
        days: diffDays,
      }
    }

    return null
  }, [group.subscription])

  if (!bannerData) return null

  const isExpired = bannerData.type === "expired"

  return (
    <div
      className={`flex flex-col gap-4 rounded-xl border p-4 shadow-sm transition-all sm:flex-row sm:items-center sm:justify-between ${
        isExpired
          ? "border-rose-200 bg-rose-50/70 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300"
          : "border-amber-200 bg-amber-50/70 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300"
      }`}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle
          className={`mt-0.5 size-5 shrink-0 ${
            isExpired
              ? "text-rose-600 dark:text-rose-400"
              : "text-amber-600 dark:text-amber-400"
          }`}
        />
        <div className="space-y-0.5">
          <p className="text-sm font-semibold">
            {isExpired
              ? canManage
                ? t(
                    "activitySchedule.subExpiredOwner",
                    "Gói dịch vụ nhóm đã hết hạn. Vui lòng gia hạn để mở khóa toàn bộ tính năng ghi dữ liệu."
                  )
                : t(
                    "activitySchedule.subExpiredMember",
                    "Nhóm đang bị tạm khóa tính năng ghi dữ liệu bởi quản trị viên."
                  )
              : canManage
                ? t(
                    "activitySchedule.subExpiringOwner",
                    "Gói dịch vụ nhóm sắp hết hạn sau {{days}} ngày. Vui lòng gia hạn để không bị gián đoạn hoạt động.",
                    { days: bannerData.days }
                  )
                : t(
                    "activitySchedule.subExpiringMember",
                    "Gói dịch vụ nhóm sắp hết hạn. Trưởng nhóm cần thực hiện thanh toán gia hạn."
                  )}
          </p>
        </div>
      </div>
      {canManage && (
        <Button
          size="sm"
          onClick={() => router.push("/subscriptions")}
          className={`shrink-0 gap-1.5 font-bold shadow-sm ${
            isExpired
              ? "bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-700 dark:hover:bg-rose-600"
              : "bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600"
          }`}
        >
          <CreditCard className="size-4" />
          {t("activitySchedule.subRenewBtn", "Gia hạn ngay")}
        </Button>
      )}
    </div>
  )
}
