import { PageContainer } from "@/components/page-container"
import { getGroupsByUserId } from "@/features/groups/api/groups-service"
import type { Group } from "@/features/groups/types"
import {
  getUserMatchStats,
  listMatches,
} from "@/features/matches/api/matches-service"
import type { Match, UserMatchStats } from "@/features/matches/types"
import { getUserProfile } from "@/features/profile/api/profile-service"
import { GroupCard } from "@/features/profile/components/group-card"
import { MatchHistory } from "@/features/profile/components/match-history-card"
import { ProfileHeader } from "@/features/profile/components/profile-header"
import { RightPanel } from "@/features/profile/components/right-panel"
import { StatsCard } from "@/features/profile/components/stats-card"
import type { User } from "@/features/profile/types"

type PageProps = {
  params: Promise<{ userId: string }>
}

export default async function OtherProfilePage({ params }: PageProps) {
  const { userId } = await params

  let user: User | null = null
  let stats: UserMatchStats | null = null
  let recentMatches: Match[] = []
  let memberGroups: Group[] = []

  try {
    user = await getUserProfile(userId)
  } catch {
    console.warn("Failed to fetch public profile, showing limited info.")
  }

  if (user?.id) {
    try {
      const [statsPayload, matchesPayload] = await Promise.all([
        getUserMatchStats(user.id),
        listMatches({ userId: user.id, page: 1, limit: 5 }),
      ])

      stats = statsPayload
      recentMatches = matchesPayload.data
    } catch {
      console.warn(
        "Failed to fetch profile stats or matches, showing defaults."
      )
    }
  }

  if (user?.id) {
    try {
      memberGroups = await getGroupsByUserId(user.id)
    } catch {
      console.warn("Failed to fetch user groups, showing empty list.")
    }
  }

  const safeStats: UserMatchStats = {
    totalMatches: stats?.totalMatches ?? 0,
    wins: stats?.wins ?? 0,
    losses: stats?.losses ?? 0,
    draws: stats?.draws ?? 0,
    winRate: stats?.winRate ?? 0,
  }

  return (
    <div className="min-h-screen bg-background py-6 text-foreground">
      <PageContainer className="space-y-6">
        <ProfileHeader
          name={user?.fullName || "Unnamed Player"}
          subtitle={
            user?.bio?.trim() || "Người dùng này chưa cập nhật giới thiệu."
          }
          avatarUrl={user?.avatarUrl}
        />

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <StatsCard
              totalMatches={safeStats.totalMatches}
              wins={safeStats.wins}
              losses={safeStats.losses}
              winRate={safeStats.winRate}
            />

            <MatchHistory
              matches={recentMatches}
              currentUserId={user?.id ?? ""}
            />

            <GroupCard groups={memberGroups} />
          </div>

          <RightPanel user={user} />
        </div>
      </PageContainer>
    </div>
  )
}
