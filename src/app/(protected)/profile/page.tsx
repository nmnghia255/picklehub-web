import { PageContainer } from "@/components/page-container"
import type { AuthUser } from "@/features/auth/types"
import { MatchHistory } from "@/features/profile/components/match-history-card"
import { ProfileHeader } from "@/features/profile/components/profile-header"
import { RankingCard } from "@/features/profile/components/ranking-card"
import { RightPanel } from "@/features/profile/components/right-panel"
import { StatsCard } from "@/features/profile/components/stats-card"
import type { User } from "@/features/profile/types"
import { getAuthenticatedAxios } from "@/lib/server-api"

export default async function ProfilePage() {
  let user: User | null = null
  let authUser: AuthUser | null = null
  try {
    const axios = await getAuthenticatedAxios()
    const meResponse = await axios.get<User>("/api/users/me")
    user = meResponse.data

    const authResponse = await axios.get<AuthUser>("/api/auth/me")
    authUser = authResponse.data
  } catch {
    // Fallback to session data if API call fails
  }

  return (
    <div className="min-h-screen bg-background py-6 text-foreground">
      <PageContainer className="space-y-6">
        {/* Header */}
        <ProfileHeader
          name={user?.fullName || authUser?.name || "Unnamed Player"}
          email={authUser?.email || "No email available"}
        />

        <div className="grid grid-cols-3 gap-6">
          {/* Left */}
          <div className="col-span-2 space-y-6">
            <RankingCard />
            <StatsCard />
            <MatchHistory />
          </div>

          {/* Right */}
          <RightPanel user={user} />
        </div>
      </PageContainer>
    </div>
  )
}
