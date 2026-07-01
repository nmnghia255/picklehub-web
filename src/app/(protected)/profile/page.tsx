export const dynamic = "force-dynamic"

import { PageContainer } from "@/components/page-container"
import type { AuthUser } from "@/features/auth/types"
import { getMyGroups } from "@/features/groups/api/groups-service"
import type { Group } from "@/features/groups/types"
import {
  getUserMatchStats,
  listMatches,
} from "@/features/matches/api/matches-service"
import type { Match, UserMatchStats } from "@/features/matches/types"
import { getMyProfile } from "@/features/profile/api/profile-service"
import { GroupCard } from "@/features/profile/components/group-card"
import { MatchHistory } from "@/features/profile/components/match-history-card"
import { ProfileHeader } from "@/features/profile/components/profile-header"
import { ProfileSubscriptions } from "@/features/profile/components/profile-subscriptions"
import { RightPanel } from "@/features/profile/components/right-panel"
import { StatsCard } from "@/features/profile/components/stats-card"
import type { User } from "@/features/profile/types"
import { SubscriptionService } from "@/features/subscriptions/api/subscriptions-service"
import type { Subscription } from "@/features/subscriptions/types/subscriptions"
import { getAuthenticatedAxios } from "@/lib/server-api"

export default async function ProfilePage() {
  let user: User | null = null
  let authUser: AuthUser | null = null
  let stats: UserMatchStats | null = null
  let recentMatches: Match[] = []
  let memberGroups: Group[] = []

  try {
    user = await getMyProfile()
  } catch {
    // Keep null and fallback to auth/session data.
    console.warn("Failed to fetch user profile, showing limited info.")
  }

  try {
    const axios = await getAuthenticatedAxios()
    const authResponse = await axios.get<AuthUser>("/api/auth/me")
    authUser = authResponse.data
  } catch {
    // Keep null and fallback to static placeholders.
    console.warn("Failed to fetch authenticated user info, showing defaults.")
  }

  const currentUserId = user?.id || authUser?.id || null

  if (currentUserId) {
    try {
      const [statsPayload, matchesPayload] = await Promise.all([
        getUserMatchStats(currentUserId),
        listMatches({ userId: currentUserId, page: 1, limit: 5 }),
      ])

      stats = statsPayload
      recentMatches = matchesPayload.data
    } catch {
      // Keep default empty values when matches API is unavailable
      console.warn(
        "Failed to fetch match stats or recent matches, showing defaults."
      )
    }
  }

  try {
    memberGroups = await getMyGroups()
  } catch {
    console.warn("Failed to fetch member groups, showing empty list.")
  }

  let subscriptions: Subscription[] = []
  try {
    subscriptions = await SubscriptionService.getMySubscriptions()
  } catch (error) {
    console.warn("Failed to fetch user subscriptions:", error)
  }

  subscriptions = subscriptions.filter((sub) => sub.status === "ACTIVE")

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
        {/* Header */}
        <ProfileHeader
          name={user?.fullName || authUser?.name || "Unnamed Player"}
          subtitle={authUser?.email || "No email available"}
          avatarUrl={user?.avatarUrl}
          actionHref="/profile/edit-profile"
        />

        <div className="grid grid-cols-3 gap-6">
          {/* Left */}
          <div className="col-span-2 space-y-6">
            <StatsCard
              totalMatches={safeStats.totalMatches}
              wins={safeStats.wins}
              losses={safeStats.losses}
              winRate={safeStats.winRate}
            />

            <MatchHistory
              matches={recentMatches}
              currentUserId={currentUserId ?? ""}
            />

            <GroupCard groups={memberGroups} />

            <ProfileSubscriptions
              subscriptions={subscriptions}
              isOwnProfile={true}
            />
          </div>

          {/* Right */}
          <RightPanel user={user} />
        </div>
      </PageContainer>
    </div>
  )
}
