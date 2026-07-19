"use client"

import { useQuery } from "@tanstack/react-query"

import type { Subscription } from "@/features/subscriptions/types/subscriptions"
import enSubscriptions from "@/i18n/locales/en/subscriptions.json"
import viSubscriptions from "@/i18n/locales/vi/subscriptions.json"

export const subscriptionQueryKeys = {
  me: () => ["subscriptions", "me"] as const,
}

async function fetchMySubscriptions(): Promise<Subscription[]> {
  const response = await fetch("/api/subscriptions/me")
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const locale = getSubscriptionLocale()
    throw new Error(errorData.message || locale.errorOccurred)
  }
  const json = await response.json()
  if (json && typeof json === "object" && "success" in json && "data" in json) {
    return json.data as Subscription[]
  }
  return json as Subscription[]
}

function getSubscriptionLocale() {
  const language =
    typeof navigator !== "undefined" ? (navigator.language ?? "") : ""
  return language.toLowerCase().startsWith("vi")
    ? viSubscriptions
    : enSubscriptions
}

export function useMySubscriptions() {
  return useQuery({
    queryKey: subscriptionQueryKeys.me(),
    queryFn: fetchMySubscriptions,
  })
}
