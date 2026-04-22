import { PageContainer } from "@/components/page-container"
import type { LinkedProvider } from "@/features/auth/types"
import { EditProfileAccountCard } from "@/features/profile/components/edit-profile/edit-profile-account-card"
import { EditProfileLinkedAccountsCard } from "@/features/profile/components/edit-profile/edit-profile-linked-accounts-card"
import { EditProfilePlayerInfoCard } from "@/features/profile/components/edit-profile/edit-profile-player-info-card"
import { EditProfileSecurityCard } from "@/features/profile/components/edit-profile/edit-profile-security-card"
import type { User } from "@/features/profile/types"
import { getAuthenticatedAxios } from "@/lib/server-api"
import { getSession } from "@/lib/session"

export default async function ProfilePage() {
  const session = await getSession()
  // session.user is guaranteed non-null by (protected)/layout.tsx
  const sessionUser = session.user!

  let user: User | null = null
  let linkedProviders: LinkedProvider[] = []
  try {
    const axios = await getAuthenticatedAxios()
    const [meResponse, linkedResponse] = await Promise.all([
      axios.get<User>("/api/users/me"),
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
          Cập nhật tên, avatar, giới thiệu, giới tính, tự đánh giá và tay thuận
          của bạn.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <EditProfileAccountCard
          avatarUrl={user?.avatarUrl}
          displayName={displayName}
          email={user?.email || sessionUser.email}
        />
        <EditProfileLinkedAccountsCard linkedProviders={linkedProviders} />
      </div>

      <EditProfilePlayerInfoCard user={user} />
      <EditProfileSecurityCard />
    </PageContainer>
  )
}
