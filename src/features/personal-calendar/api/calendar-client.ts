import { useQuery } from "@tanstack/react-query"
import axios from "axios"

// Use a simple axios instance for relative requests to avoid CORS
const localClient = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
})

// --- Types ---
export type CalendarActivityType =
  | "BOOKING"
  | "SOCIAL_SESSION"
  | "MATCH_PRACTICE"
  | "MATCH_TOURNAMENT"
  | "TOURNAMENT"

export type CalendarActivityStatus =
  | "UPCOMING"
  | "LIVE"
  | "PENDING_CONFIRM"
  | "COMPLETED"
  | "CANCELLED"

export type CalendarUserRole =
  | "OWNER"
  | "PARTICIPANT"
  | "COACH"
  | "PLAYER"
  | "HOST"

export interface CalendarLocation {
  name: string
  address: string
}

export interface CalendarActivity {
  id: string
  title: string
  startTime: string
  endTime: string
  type: CalendarActivityType
  status: CalendarActivityStatus
  role: CalendarUserRole
  location: CalendarLocation
  metadata?: Record<string, unknown>
  participantsCount: number
  organizer: string
  description: string
}

export type GetMyCalendarResponse = CalendarActivity[]

// Raw item shape from the backend API
interface CalendarApiItem {
  id: string
  type: string
  title: string
  startTime: string
  endTime: string
  location: {
    name: string
    address?: string
    centerId?: string
  }
  status: string
  role: string
  metadata?: Record<string, unknown>
}

interface CalendarApiResponse {
  success: boolean
  message?: string
  data: {
    items: CalendarApiItem[]
    warnings?: string[]
  }
}

function mapApiItem(item: CalendarApiItem): CalendarActivity {
  return {
    id: item.id,
    title: item.title,
    startTime: item.startTime,
    endTime: item.endTime,
    type: item.type as CalendarActivityType,
    status: item.status as CalendarActivityStatus,
    role: item.role as CalendarUserRole,
    location: {
      name: item.location.name,
      address: item.location.address ?? "",
    },
    metadata: item.metadata,
    participantsCount: 0,
    organizer: "",
    description: "",
  }
}

// --- API Layer ---

export const calendarQueryKeys = {
  all: ["calendar"] as const,
  lists: (startDate?: string, endDate?: string) =>
    [...calendarQueryKeys.all, "list", { startDate, endDate }] as const,
}

export async function getMyCalendar(
  startDate?: string,
  endDate?: string
): Promise<GetMyCalendarResponse> {
  const params: Record<string, string> = {}
  if (startDate) params.startDate = startDate
  if (endDate) params.endDate = endDate

  const response = await localClient.get<CalendarApiResponse>(
    "/api/users/me/calendar",
    { params }
  )

  const items = response.data?.data?.items ?? []
  return items.map(mapApiItem)
}

// --- React Query Hook ---

export function useMyCalendar(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: calendarQueryKeys.lists(startDate, endDate),
    queryFn: () => getMyCalendar(startDate, endDate),
    enabled: !!startDate && !!endDate,
  })
}
