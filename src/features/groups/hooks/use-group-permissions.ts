import { useMemo } from "react"

import type { Group } from "../types"

interface UseGroupPermissionsProps {
  group: Group
  currentUserRole?: string | null
}

export function useGroupPermissions({
  group,
  currentUserRole,
}: UseGroupPermissionsProps) {
  const isOwner = useMemo(() => {
    return currentUserRole?.toLowerCase() === "owner"
  }, [currentUserRole])

  const isMember = useMemo(() => {
    return !!currentUserRole
  }, [currentUserRole])

  // Kiểm tra gói dịch vụ có đang kích hoạt hay không
  const hasValidSubscription = useMemo(() => {
    // Nếu subscription không tồn tại hoặc hasAccess là false, xem như hết hạn
    return group.subscription?.hasAccess === true
  }, [group.subscription])

  // Quyền ghi = Có gói dịch vụ hợp lệ VÀ là thành viên nhóm
  const canWrite = useMemo(() => {
    return hasValidSubscription && isMember
  }, [hasValidSubscription, isMember])

  return {
    canWrite,
    hasValidSubscription,
    isMember,
    isOwner,
  }
}
