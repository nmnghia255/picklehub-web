import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect } from "react"

import type { Group, Invitation, Member, PaginatedResponse } from "../types"
import { financeQueryKeys } from "./finance-client"
import { fetchGroupJson } from "./group-fetch-client"
import { groupQueryKeys } from "./group-query-keys"

export { groupQueryKeys }

export async function getGroupClient(groupId: string): Promise<Group> {
  return fetchGroupJson<Group>(`/api/groups/${groupId}`)
}

export async function getGroupMembersClient(
  groupId: string,
  params?: { activityId?: string }
): Promise<Member[]> {
  const query = params?.activityId ? `?activityId=${params.activityId}` : ""
  const res = await fetchGroupJson<PaginatedResponse<Member>>(
    `/api/groups/${groupId}/members${query}`
  )
  return res.data
}

export async function getGroupInvitationsClient(
  groupId: string
): Promise<Invitation[]> {
  return fetchGroupJson<Invitation[]>(`/api/groups/${groupId}/invitations`)
}

export function useSyncGroupData<T>(
  queryKey: readonly unknown[],
  data: T | undefined
) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (data === undefined) return

    const cachedData = queryClient.getQueryData<T>(queryKey)
    if (JSON.stringify(cachedData) !== JSON.stringify(data)) {
      queryClient.setQueryData(queryKey, data)
    }
  }, [queryKey, data, queryClient])
}

export function useGroupInvalidation(groupId: string) {
  const queryClient = useQueryClient()

  const invalidateAll = useCallback(() => {
    return Promise.all([
      queryClient.invalidateQueries({
        queryKey: groupQueryKeys.detail(groupId),
      }),
      queryClient.invalidateQueries({
        queryKey: groupQueryKeys.members(groupId),
      }),
      queryClient.invalidateQueries({
        queryKey: groupQueryKeys.invitations(groupId),
      }),
      queryClient.invalidateQueries({ queryKey: ["group-finance", groupId] }),
      queryClient.invalidateQueries({
        queryKey: ["group-activities", groupId],
      }),
    ])
  }, [queryClient, groupId])

  const invalidateMembers = useCallback(() => {
    return Promise.all([
      queryClient.invalidateQueries({
        queryKey: groupQueryKeys.members(groupId),
      }),
      queryClient.invalidateQueries({
        queryKey: groupQueryKeys.detail(groupId),
      }),
      queryClient.invalidateQueries({
        queryKey: financeQueryKeys.summary(groupId),
      }),
    ])
  }, [queryClient, groupId])

  const invalidateFinance = useCallback(() => {
    return queryClient.invalidateQueries({
      queryKey: ["group-finance", groupId],
    })
  }, [queryClient, groupId])

  const invalidateInvitations = useCallback(() => {
    return queryClient.invalidateQueries({
      queryKey: groupQueryKeys.invitations(groupId),
    })
  }, [queryClient, groupId])

  const invalidateActivities = useCallback(() => {
    return queryClient.invalidateQueries({
      queryKey: ["group-activities", groupId],
    })
  }, [queryClient, groupId])

  const invalidateCourtBookings = useCallback(() => {
    return queryClient.invalidateQueries({
      queryKey: [...groupQueryKeys.detail(groupId), "courtBookings"],
    })
  }, [queryClient, groupId])

  return {
    invalidateAll,
    invalidateMembers,
    invalidateFinance,
    invalidateInvitations,
    invalidateActivities,
    invalidateCourtBookings,
  }
}

// Temporary compatibility layer: existing Group consumers can migrate safely.
export {
  cancelCourtBookingClient,
  checkCancelEligibilityClient,
  getGroupCourtBookingClient,
  getMyBookingsClient,
  linkGroupCourtBookingClient,
  listGroupCourtBookingsClient,
  unlinkGroupCourtBookingClient,
} from "./group-court-bookings-client"
