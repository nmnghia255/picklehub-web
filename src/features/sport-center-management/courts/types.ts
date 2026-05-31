import type { Court } from "@/features/sport-center-management/types/court"

// ============================================================================
// Court enums (aligned with sport-centers API)
// ============================================================================

export type CourtType = "INDOOR" | "OUTDOOR"

export type CourtStatus = "ACTIVE" | "MAINTENANCE" | "ARCHIVED"

export const COURT_TYPE_LABELS: Record<CourtType, string> = {
  INDOOR: "Trong nhà",
  OUTDOOR: "Ngoài trời",
}

export const COURT_STATUS_LABELS: Record<CourtStatus, string> = {
  ACTIVE: "Đang hoạt động",
  MAINTENANCE: "Đang bảo trì",
  ARCHIVED: "Đã lưu trữ",
}

export const COURT_TYPE_OPTIONS: { value: CourtType; label: string }[] = (
  Object.keys(COURT_TYPE_LABELS) as CourtType[]
).map((value) => ({ value, label: COURT_TYPE_LABELS[value] }))

export const COURT_STATUS_OPTIONS: { value: CourtStatus; label: string }[] = (
  Object.keys(COURT_STATUS_LABELS) as CourtStatus[]
).map((value) => ({ value, label: COURT_STATUS_LABELS[value] }))

export function getCourtTypeLabel(type: string) {
  return COURT_TYPE_LABELS[type as CourtType] ?? type
}

export function getCourtStatusLabel(status: string) {
  return COURT_STATUS_LABELS[status as CourtStatus] ?? status
}

export type { Court }
