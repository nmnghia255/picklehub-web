"use client"

import { useQuery } from "@tanstack/react-query"

import type { Subscription } from "@/features/subscriptions/types/subscriptions"

export const subscriptionQueryKeys = {
  me: () => ["subscriptions", "me"] as const,
}

async function fetchMySubscriptions(): Promise<Subscription[]> {
  const response = await fetch("/api/subscriptions/me")
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || "Failed to fetch subscriptions")
  }
  return response.json()
}

export function useMySubscriptions() {
  return useQuery({
    queryKey: subscriptionQueryKeys.me(),
    queryFn: fetchMySubscriptions,
    staleTime: Infinity, // Keep the cached subscription data fresh indefinitely (session-like storage)
    gcTime: Infinity, // Prevent garbage collection of subscription cache
  })
}
