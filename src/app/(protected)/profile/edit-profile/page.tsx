export const dynamic = "force-dynamic"

import type { LinkedProvider } from "@/features/auth/types"
import { PaymentProfileService } from "@/features/profile/api/payment-profile-service"
import {
  getMyLinkedProviders,
  getMyProfile,
} from "@/features/profile/api/profile-service"
import { EditProfileContent } from "@/features/profile/components/edit-profile/edit-profile-content"
import type { PaymentProfile, User } from "@/features/profile/types"
import { getSession } from "@/lib/session"

export default async function ProfilePage() {
  const session = await getSession()
  // session.user is guaranteed non-null by (protected)/layout.tsx
  const sessionUser = session.user!

  let user: User | null = null
  let linkedProviders: LinkedProvider[] = []
  let paymentProfiles: PaymentProfile[] = []

  const [profileResult, providersResult, paymentProfilesResult] =
    await Promise.allSettled([
      getMyProfile(),
      getMyLinkedProviders(),
      PaymentProfileService.getPaymentProfile(),
    ])

  if (profileResult.status === "fulfilled") {
    user = profileResult.value
  }

  if (providersResult.status === "fulfilled") {
    linkedProviders = providersResult.value
  }

  if (
    paymentProfilesResult.status === "fulfilled" &&
    paymentProfilesResult.value
  ) {
    const val = paymentProfilesResult.value
    paymentProfiles = Array.isArray(val) ? val : [val]
  }

  return (
    <EditProfileContent
      initialUser={user}
      initialLinkedProviders={linkedProviders}
      initialPaymentProfiles={paymentProfiles}
      sessionEmail={sessionUser.email}
    />
  )
}
