import type { LinkedProvider } from "@/features/auth/types"
import {
  getMyLinkedProviders,
  getMyProfile,
} from "@/features/profile/api/profile-service"
import type { User } from "@/features/profile/types"

import { SettingsContent } from "./settings-content"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  let linkedProviders: LinkedProvider[] = []
  let user: User | null = null

  try {
    const [providersResult, profileResult] = await Promise.allSettled([
      getMyLinkedProviders(),
      getMyProfile(),
    ])

    if (providersResult.status === "fulfilled") {
      linkedProviders = providersResult.value
    }

    if (profileResult.status === "fulfilled") {
      user = profileResult.value
    }
  } catch {
    // Keep the page usable even if API calls fail.
  }

  return <SettingsContent linkedProviders={linkedProviders} user={user} />
}
