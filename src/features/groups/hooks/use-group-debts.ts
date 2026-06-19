"use client"

import { useQuery } from "@tanstack/react-query"

import { financeQueryKeys, listGroupDebtsClient } from "../api/finance-client"

export interface UseGroupDebtsParams {
  page?: number
  limit?: number
  search?: string
  [key: string]: string | number | boolean | null | undefined
}

export function useGroupDebts(
  groupId: string,
  params: UseGroupDebtsParams = {},
  options: { enabled?: boolean } = {}
) {
  return useQuery({
    queryKey: financeQueryKeys.debts(groupId, params),
    queryFn: () => listGroupDebtsClient(groupId, params),
    enabled: options.enabled,
  })
}
