export const dynamic = "force-dynamic"

import { AccountContent } from "@/features/auth/components/account-content"
import type { LinkedProvider } from "@/features/auth/types"
import { getMyLinkedProviders } from "@/features/profile/api/profile-service"

export default async function AccountPage() {
  let linkedProviders: LinkedProvider[] = []
  try {
    linkedProviders = await getMyLinkedProviders()
  } catch (error) {
    console.error("Failed to fetch linked providers:", error)
  }

  return <AccountContent linkedProviders={linkedProviders} />
}
