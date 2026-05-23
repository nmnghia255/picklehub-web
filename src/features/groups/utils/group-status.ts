import type { GroupStatus } from "../types"

const ARCHIVED_GROUP_STATUS: GroupStatus = "ARCHIVED"

export function normalizeGroupStatus(status: string | null | undefined) {
  return status?.toUpperCase() as GroupStatus | undefined
}

export function isArchivedGroup(status: string | null | undefined) {
  return normalizeGroupStatus(status) === ARCHIVED_GROUP_STATUS
}

export function getArchivedGroupLabel() {
  return "Đã lưu trữ"
}
