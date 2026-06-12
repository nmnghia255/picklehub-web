import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect } from "react"

import type { Group, Invitation, Member } from "../types"
import { financeQueryKeys } from "./finance-client"

type QueryParams = Record<string, string | number | boolean | null | undefined>

type FetchJsonError = Error & {
  status?: number
  data?: unknown
  url?: string
}

function toSearchParams(params?: QueryParams) {
  const searchParams = new URLSearchParams()

  if (!params) {
    return searchParams
  }

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") {
      continue
    }

    searchParams.set(key, String(value))
  }

  return searchParams
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    credentials: "same-origin",
    cache: "no-store",
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    const payloadMessage = (() => {
      if (!payload || typeof payload !== "object") {
        return null
      }

      const message = (payload as { message?: unknown }).message
      if (typeof message === "string") {
        return message
      }

      if (Array.isArray(message)) {
        return message
          .map((item) => (typeof item === "string" ? item : null))
          .filter(Boolean)
          .join(", ")
      }

      return null
    })()

    const error = new Error(
      payloadMessage || "Đã có lỗi xảy ra."
    ) as FetchJsonError
    error.status = response.status
    error.data = payload
    error.url = url
    throw error
  }

  return (await response.json()) as T
}

export const groupQueryKeys = {
  all: ["groups"] as const,
  lists: () => [...groupQueryKeys.all, "list"] as const,
  detail: (groupId: string) =>
    [...groupQueryKeys.all, "detail", groupId] as const,
  members: (groupId: string) =>
    [...groupQueryKeys.detail(groupId), "members"] as const,
  invitations: (groupId: string) =>
    [...groupQueryKeys.detail(groupId), "invitations"] as const,
}

export async function getGroupClient(groupId: string): Promise<Group> {
  return fetchJson<Group>(`/api/groups/${groupId}`)
}

export async function getGroupMembersClient(
  groupId: string
): Promise<Member[]> {
  return fetchJson<Member[]>(`/api/groups/${groupId}/members`)
}

export async function getGroupInvitationsClient(
  groupId: string
): Promise<Invitation[]> {
  return fetchJson<Invitation[]>(`/api/groups/${groupId}/invitations`)
}

/**
 * Hook to synchronize server-side props with TanStack Query cache.
 * Essential for Next.js App Router where Server Actions + revalidatePath
 * can update props but don't automatically update client-side cache.
 */
export function useSyncGroupData<T>(
  queryKey: readonly unknown[],
  data: T | undefined
) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (data === undefined) return

    const cachedData = queryClient.getQueryData<T>(queryKey)

    // Only update if the data is actually different, to prevent infinite loops
    if (JSON.stringify(cachedData) !== JSON.stringify(data)) {
      queryClient.setQueryData(queryKey, data)
    }
  }, [queryKey, data, queryClient])
}

/**
 * Centralized hook for invalidating Group-related data.
 * Ensures that all dependent queries are refreshed together.
 */
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

  return {
    invalidateAll,
    invalidateMembers,
    invalidateFinance,
    invalidateInvitations,
    invalidateActivities,
  }
}
