import { useQuery } from "@tanstack/react-query"
import axios from "axios"

// Use a simple axios instance for relative requests to avoid CORS
const localClient = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
})

// --- Types ---
// ... (keep types same)
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

export type CalendarUserRole = "OWNER" | "PARTICIPANT" | "COACH"

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

  const response = await localClient.get<
    { activities?: GetMyCalendarResponse } | GetMyCalendarResponse
  >("/api/users/me/calendar", {
    params,
  })

  // Handle case where API might return { activities: [...] } or just [...]
  const data = response.data
  if (Array.isArray(data)) {
    return data
  }
  return (data as { activities: GetMyCalendarResponse }).activities || []
}

// --- React Query Hook ---

export function useMyCalendar(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: calendarQueryKeys.lists(startDate, endDate),
    queryFn: () => getMyCalendar(startDate, endDate),
    enabled: !!startDate && !!endDate,
  })
}
