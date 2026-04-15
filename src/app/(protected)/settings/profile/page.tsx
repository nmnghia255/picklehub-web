import Link from "next/link"

import { PageContainer } from "@/components/page-container"
import { Button } from "@/components/ui/button"
import type { AuthUser } from "@/features/auth/types"
import { MatchHistory } from "@/features/profile/components/match-history-card"
import { ProfileCard } from "@/features/profile/components/profile-card"
import { RankingCard } from "@/features/profile/components/ranking-card"
import { RightPanel } from "@/features/profile/components/right-panel"
import { StatsCard } from "@/features/profile/components/stats-card"
import { getAuthenticatedAxios } from "@/lib/server-api"

export default async function ProfilePage() {
  let user: AuthUser | null = null
  try {
    const axios = await getAuthenticatedAxios()
    const meResponse = await axios.get<AuthUser>("/api/auth/me")
    user = meResponse.data
  } catch {
    // Fallback to session data if API call fails
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <PageContainer className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Hồ sơ người dùng</h1>
          <Button>
            <Link href="/settings/edit-profile">Sửa hồ sơ</Link>
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left */}
          <div className="col-span-2 space-y-6">
            <ProfileCard user={user} />
            <RankingCard />
            <StatsCard />
            <MatchHistory />
          </div>

          {/* Right */}
          <RightPanel />
        </div>
      </PageContainer>
    </div>
  )
}
