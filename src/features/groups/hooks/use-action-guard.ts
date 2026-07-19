"use client"

import { useRouter } from "next/navigation"
import { createElement, useCallback, useState } from "react"

import { useGroupsTranslation } from "@/i18n/use-groups-translation"

import { PermissionDialog } from "../components/details/permission-dialog"
import type { Group } from "../types"
import { useGroupPermissions } from "./use-group-permissions"

interface GuardOptions {
  featureName: string
  onUpgrade?: () => void
}

export function useActionGuard(
  group?: Group | null,
  currentUserRole?: string | null
) {
  const { t } = useGroupsTranslation()
  const router = useRouter()
  const { canWrite, hasValidSubscription, isOwner, isMember } =
    useGroupPermissions({ group: group || ({} as Group), currentUserRole })

  const [dialogState, setDialogState] = useState<{
    open: boolean
    title: string
    description: string
    showUpgradeButton: boolean
    showContactOwner: boolean
    ownerName?: string
  }>({
    open: false,
    title: "",
    description: "",
    showUpgradeButton: false,
    showContactOwner: false,
    ownerName: undefined,
  })

  const guardWriteAction = useCallback(
    (action: () => void, options: GuardOptions) => {
      if (canWrite) {
        action()
      } else {
        let title = t(
          "dashboard.permissionRequiredTitle",
          "Yêu cầu gia hạn gói dịch vụ"
        )
        let description = ""
        let showUpgradeButton = false
        let showContactOwner = false

        if (!hasValidSubscription) {
          title = t(
            "dashboard.permissionExpiredTitle",
            "Gói dịch vụ nhóm đã hết hạn"
          )
          description = t(
            "dashboard.permissionExpiredDesc",
            "Để {{feature}}, nhóm cần gia hạn gói dịch vụ.",
            {
              feature: options.featureName,
            }
          )

          if (isOwner) {
            showUpgradeButton = true
            description += t(
              "dashboard.permissionExpiredOwnerSuffix",
              " Hãy gia hạn ngay để tiếp tục sử dụng tất cả tính năng."
            )
          } else {
            showContactOwner = true
            description += t(
              "dashboard.permissionExpiredMemberSuffix",
              " Vui lòng liên hệ Chủ nhóm để gia hạn."
            )
          }
        } else if (!isMember) {
          title = t(
            "dashboard.permissionNoAccessTitle",
            "Không có quyền truy cập"
          )
          description = t(
            "dashboard.permissionNoAccessDesc",
            "Bạn không phải là thành viên của nhóm này."
          )
        }

        setDialogState({
          open: true,
          title,
          description,
          showUpgradeButton,
          showContactOwner,
          ownerName: undefined, // Có thể mở rộng lấy từ list members sau nếu cần
        })
      }
    },
    [canWrite, hasValidSubscription, isOwner, isMember]
  )

  // Bound dialog component to render at root level of parent
  const PermissionDialogComponent = useCallback(() => {
    return createElement(PermissionDialog, {
      open: dialogState.open,
      onOpenChange: (open) => setDialogState((prev) => ({ ...prev, open })),
      title: dialogState.title,
      description: dialogState.description,
      showUpgradeButton: dialogState.showUpgradeButton,
      showContactOwner: dialogState.showContactOwner,
      ownerName: dialogState.ownerName,
      onUpgrade: () => {
        setDialogState((prev) => ({ ...prev, open: false }))
        router.push("/subscriptions")
      },
    })
  }, [dialogState, router])

  return {
    guardWriteAction,
    PermissionDialog: PermissionDialogComponent,
    canWrite,
    hasValidSubscription,
    isOwner,
    isMember,
  }
}
