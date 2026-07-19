"use client"

import { AlertTriangle, CreditCard, Lock } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useGroupsTranslation } from "@/i18n/use-groups-translation"

interface PermissionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  showUpgradeButton?: boolean
  showContactOwner?: boolean
  ownerName?: string
  onUpgrade?: () => void
}

export function PermissionDialog({
  open,
  onOpenChange,
  title,
  description,
  showUpgradeButton,
  showContactOwner,
  ownerName,
  onUpgrade,
}: PermissionDialogProps) {
  const { t } = useGroupsTranslation()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="group-feature-root sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <Lock className="size-5 shrink-0" />
            {title}
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Section for Group Owner */}
          {showUpgradeButton && (
            <>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                  {t(
                    "dashboard.subscriptionBenefitsTitle",
                    "Quyền lợi khi gia hạn gói dịch vụ nhóm:"
                  )}
                </p>
                <ul className="mt-2 space-y-1.5 text-xs text-emerald-700 dark:text-emerald-400">
                  <li className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {t(
                      "dashboard.benefitActivities",
                      "Quản lý & điểm danh lịch hoạt động nhóm"
                    )}
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {t(
                      "dashboard.benefitBookings",
                      "Liên kết lịch đặt sân từ cụm sân"
                    )}
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {t(
                      "dashboard.benefitEquipment",
                      "Quản lý dụng cụ và template dụng cụ"
                    )}
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {t(
                      "dashboard.benefitFinance",
                      "Theo dõi thu chi, hóa đơn và tài chính"
                    )}
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {t(
                      "dashboard.benefitMembers",
                      "Mời thành viên và phân quyền"
                    )}
                  </li>
                </ul>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={onUpgrade}
                  className="flex-1 bg-emerald-600 font-bold hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
                >
                  <CreditCard className="mr-2 size-4" />
                  {t("activitySchedule.subRenewBtn", "Gia hạn ngay")}
                </Button>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  {t("activitySchedule.btnCancel", "Để sau")}
                </Button>
              </div>
            </>
          )}

          {/* Section for Members */}
          {showContactOwner && (
            <>
              <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
                <AlertTriangle className="size-5 shrink-0 text-amber-600 dark:text-amber-400" />
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  {t(
                    "dashboard.contactOwnerWarning",
                    "Gói dịch vụ của nhóm hiện tại đã hết hạn. Vui lòng liên hệ Chủ nhóm ({{ownerName}}) để thực hiện gia hạn.",
                    {
                      ownerName:
                        ownerName || t("dashboard.roleOwner", "Trưởng nhóm"),
                    }
                  )}
                </p>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => onOpenChange(false)}
              >
                {t("activitySchedule.btnConfirm", "Đã hiểu")}
              </Button>
            </>
          )}

          {/* Fallback case if not matching either */}
          {!showUpgradeButton && !showContactOwner && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onOpenChange(false)}
            >
              {t("activitySchedule.btnConfirm", "Đã hiểu")}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
