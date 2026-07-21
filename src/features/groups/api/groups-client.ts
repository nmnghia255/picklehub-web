import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createContext,
  createElement,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
} from "react"

import type { Group, Invitation, Member, PaginatedResponse } from "../types"
import { financeQueryKeys } from "./finance-client"
import { fetchGroupJson } from "./group-fetch-client"
import { groupQueryKeys } from "./group-query-keys"

export { groupQueryKeys }

interface GroupDetailDataProviderProps {
  groupId: string
  group: Group
  children: ReactNode
}

interface GroupDetailContextValue {
  groupId: string
  group: Group
}

interface UseGroupDetailOptions {
  enabled?: boolean
}

const GroupDetailContext = createContext<GroupDetailContextValue | null>(null)

export function GroupDetailDataProvider({
  groupId,
  group,
  children,
}: GroupDetailDataProviderProps) {
  const queryClient = useQueryClient()
  const queryKey = groupQueryKeys.detail(groupId)

  useEffect(() => {
    queryClient.setQueryData(queryKey, group)
  }, [group, queryClient, queryKey])

  return createElement(
    GroupDetailContext.Provider,
    { value: { groupId, group } },
    children
  )
}

export function useGroupDetail(
  groupId: string,
  fallbackGroup?: Group,
  options: UseGroupDetailOptions = {}
): ReturnType<typeof useQuery<Group>> {
  const queryClient = useQueryClient()
  const context = useContext(GroupDetailContext)
  const queryKey = groupQueryKeys.detail(groupId)
  const cachedGroup = queryClient.getQueryData<Group>(queryKey)
  const initialGroup =
    context?.groupId === groupId ? context.group : fallbackGroup
  const group = initialGroup ?? cachedGroup

  return useQuery<Group>({
    queryKey,
    enabled: Boolean(groupId && group && options.enabled !== false),
    initialData: group,
    queryFn: async () => {
      const currentGroup = queryClient.getQueryData<Group>(queryKey) ?? group

      if (!currentGroup) {
        throw new Error("Group detail data is unavailable")
      }

      return currentGroup
    },
  })
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
