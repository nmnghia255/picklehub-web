export const dynamic = "force-dynamic"

import type { LinkedProvider } from "@/features/auth/types"
import {
  getMyLinkedProviders,
  getMyProfile,
} from "@/features/profile/api/profile-service"
import { EditProfileContent } from "@/features/profile/components/edit-profile/edit-profile-content"
import type { User } from "@/features/profile/types"
import { getSession } from "@/lib/session"

export default async function ProfilePage() {
  const session = await getSession()
  // session.user is guaranteed non-null by (protected)/layout.tsx
  const sessionUser = session.user!

  let user: User | null = null
  let linkedProviders: LinkedProvider[] = []
  const [profileResult, providersResult] = await Promise.allSettled([
    getMyProfile(),
    getMyLinkedProviders(),
  ])

  if (profileResult.status === "fulfilled") {
    user = profileResult.value
  }

  if (providersResult.status === "fulfilled") {
    linkedProviders = providersResult.value
  }

  console.log("Fetched user profile:", user?.selfRating)

  return (
    <EditProfileContent
      initialUser={user}
      initialLinkedProviders={linkedProviders}
      sessionEmail={sessionUser.email}
    />
  )
}
