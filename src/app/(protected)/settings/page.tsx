import type { LinkedProvider } from "@/features/auth/types"
import { getMyLinkedProviders } from "@/features/profile/api/profile-service"

import { SettingsContent } from "./settings-content"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  let linkedProviders: LinkedProvider[] = []

  try {
    linkedProviders = await getMyLinkedProviders()
  } catch {
    // Keep the page usable even if social linkage data is unavailable.
  }

  return <SettingsContent linkedProviders={linkedProviders} />
}
