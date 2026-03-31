import { PageContainer } from "@/components/page-container"
import type { LinkedProvider } from "@/features/auth/types"
import { EditProfileAccountCard } from "@/features/profile/components/edit-profile-account-card"
import { EditProfileLinkedAccountsCard } from "@/features/profile/components/edit-profile-linked-accounts-card"
import { EditProfilePlayerInfoCard } from "@/features/profile/components/edit-profile-player-info-card"
import { EditProfileSecurityCard } from "@/features/profile/components/edit-profile-security-card"
import type { ProfileDetails } from "@/features/profile/types"
import { getAuthenticatedAxios } from "@/lib/server-api"
import { getSession } from "@/lib/session"

export default async function ProfilePage() {
  const session = await getSession()
  // session.user is guaranteed non-null by (protected)/layout.tsx
  const sessionUser = session.user!

  let user: ProfileDetails | null = null
  let linkedProviders: LinkedProvider[] = []
  try {
    const axios = await getAuthenticatedAxios()
    const [meResponse, linkedResponse] = await Promise.all([
      axios.get<ProfileDetails>("/api/auth/me"),
      axios.get<LinkedProvider[]>("/api/auth/social/linked"),
    ])
    user = meResponse.data
    linkedProviders = linkedResponse.data
  } catch {
    // Fallback to session data if API call fails
  }

  const displayName =
    user?.name?.trim() || sessionUser.email.split("@")[0] || "Unnamed Player"

  return (
    <PageContainer className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Chỉnh sửa hồ sơ</h1>
        <p className="text-sm text-muted-foreground">
          Quản lý thông tin tài khoản, nhà cung cấp đã liên kết, và cài đặt bảo
          mật.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <EditProfileAccountCard
          displayName={displayName}
          email={sessionUser.email}
          userId={sessionUser.id}
        />
        <EditProfileLinkedAccountsCard linkedProviders={linkedProviders} />
      </div>

      <EditProfilePlayerInfoCard user={user} />
      <EditProfileSecurityCard />
    </PageContainer>
  )
}
