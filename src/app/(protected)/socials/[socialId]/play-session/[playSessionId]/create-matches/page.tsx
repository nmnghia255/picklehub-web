import { PlaySessionService } from "@/features/socials/api/play-session-service"
import { SocialService } from "@/features/socials/api/social-service"
import { MatchesCreationContent } from "@/features/socials/components/matches"
import type { Player } from "@/features/socials/types/match"
import { getAuthenticatedAxios } from "@/lib/server-api"

export default async function MatchesCreationPage(props: {
  params: Promise<{ socialId: string; playSessionId: string }>
}) {
  const params = await props.params

  let players: Player[] = []
  let numberOfCourts = 0
  let bookingIds: string[] = []
  let availableCourts: Array<{ id: string; name: string }> = []

  try {
    const [participants, playSession, social] = await Promise.all([
      PlaySessionService.listPlaySessionParticipants(
        params.socialId,
        params.playSessionId
      ),
      PlaySessionService.getPlaySession(params.socialId, params.playSessionId),
      SocialService.getSocial(params.socialId).catch(() => null),
    ])

    players = participants
      .filter((p) => p.status !== "CANCELLED" && p.status !== "REJECTED")
      .map((p) => ({
        id: p.id,
        participantId: p.id,
        userId:
          p.userId || (p.user as unknown as Record<string, string>)?.id || p.id,
        name:
          (p.user as { fullName?: string })?.fullName ||
          (p.user as { name?: string })?.name ||
          p.guestName ||
          "Unknown Player",
        avatarUrl:
          p.user?.avatarUrl ||
          (p.user as unknown as Record<string, string>)?.avatar,
        skillLevel: p.skillLevel ?? undefined,
        matchesPlayed:
          (p.user as { matchesPlayed?: number })?.matchesPlayed ?? 0,
        duprRating:
          (p.user as { dupr?: { rating?: number } })?.dupr?.rating ?? null,
      }))

    const isUuid = (val: string) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        val
      )

    const allBookingUuids = Array.from(
      new Set([
        ...(social?.bookingIds || []),
        ...(social?.bookings || []).map((b) => b.id).filter(Boolean),
        ...(social?.courtSchedule || [])
          .map((cs) => cs.courtId)
          .filter(Boolean),
      ])
    ).filter(isUuid)

    bookingIds = allBookingUuids

    const courtsMap = new Map<string, string>()

    // Fetch booking details for each bookingId to extract real courtId & courtName
    if (allBookingUuids.length > 0) {
      try {
        const axios = await getAuthenticatedAxios()
        await Promise.all(
          allBookingUuids.map(async (bookingId) => {
            try {
              const res = await axios.get(`/api/bookings/${bookingId}`)
              const bData = res.data?.data || res.data
              const items = bData?.items || bData?.bookingItems || []
              items.forEach(
                (item: {
                  courtId?: string
                  courtName?: string
                  court?: { id?: string; name?: string }
                }) => {
                  const cId = item.courtId || item.court?.id
                  const cName = item.courtName || item.court?.name
                  if (cId && isUuid(cId) && !courtsMap.has(cId)) {
                    courtsMap.set(cId, cName || `Sân ${cId.slice(0, 6)}`)
                  }
                }
              )
            } catch (err) {
              console.error(
                `Failed to fetch booking details for ${bookingId}:`,
                err
              )
            }
          })
        )
      } catch (err) {
        console.error("Failed to authenticate axios for booking details:", err)
      }
    }

    // Fallback 1: Check social.courtSchedule for real courtId UUIDs and courtNames
    if (social?.courtSchedule && social.courtSchedule.length > 0) {
      social.courtSchedule.forEach((cs) => {
        if (cs.courtId && isUuid(cs.courtId) && !courtsMap.has(cs.courtId)) {
          courtsMap.set(
            cs.courtId,
            cs.courtName || `Sân ${cs.courtId.slice(0, 6)}`
          )
        }
      })
    }

    // Fallback 2: Check social.bookings for real courtId and courtName (deduplicated)
    if (social?.bookings && social.bookings.length > 0) {
      social.bookings.forEach((b, index) => {
        const targetId = (b as { courtId?: string }).courtId || b.id
        if (targetId && !courtsMap.has(targetId)) {
          courtsMap.set(targetId, b.courtName || `Sân ${index + 1}`)
        }
      })
    }

    // Fallback 3: Check social.courtNames + allBookingUuids
    if (courtsMap.size === 0 && social?.courtNames) {
      const courtNameList = social.courtNames
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)

      courtNameList.forEach((courtName, index) => {
        const realUuid = allBookingUuids[index] || allBookingUuids[0]
        if (realUuid) {
          courtsMap.set(realUuid, courtName)
        }
      })
    }

    // Fallback 4: Fallback to allBookingUuids directly
    if (courtsMap.size === 0 && allBookingUuids.length > 0) {
      allBookingUuids.forEach((id, idx) => {
        courtsMap.set(id, `Sân ${idx + 1}`)
      })
    }

    availableCourts = Array.from(courtsMap.entries()).map(([id, name]) => ({
      id,
      name,
    }))
    numberOfCourts = Math.max(
      social?.numberOfCourts || 0,
      availableCourts.length
    )
  } catch (error) {
    console.error("Failed to fetch data for matches creation:", error)
  }

  return (
    <MatchesCreationContent
      initialPlayers={players}
      numberOfCourts={numberOfCourts}
      bookingIds={bookingIds}
      availableCourts={availableCourts}
    />
  )
}
