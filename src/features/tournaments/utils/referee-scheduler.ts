import type { AssignedReferee, Referee } from "../types/referee"
import type { TournamentSchedule } from "../types/schedule"

export interface MatchTimeInterval {
  matchId: string
  startMs: number | null
  endMs: number | null
  formattedSlot: string
  hasValidTime: boolean
}

export interface RefereeWorkloadSummary {
  refereeId: string
  refereeName: string
  initialCount: number
  newCount: number
  totalCount: number
}

export interface AutoScheduleResult {
  assignments: { matchId: string; refereeId: string; refereeName: string }[]
  unassignableMatches: AssignedReferee[]
  minRefereesRequired: number
  peakConcurrentMatches: number
  peakSlot: string
  refereeWorkloads: RefereeWorkloadSummary[]
  isFullyScheduled: boolean
  hasInsufficientReferees: boolean
}

/**
 * Parses match time information from AssignedReferee and scheduleMap.
 */
export function parseMatchInterval(
  match: AssignedReferee,
  scheduleMap?: Record<string, TournamentSchedule>
): MatchTimeInterval {
  const sched = scheduleMap?.[String(match.id)]

  const startTimeStr = match.startTime || sched?.startTime || match.time
  const endTimeStr = sched?.endTime
  const dateStr = sched?.date
  const duration = match.duration || 45

  if (!startTimeStr) {
    return {
      matchId: match.id,
      startMs: null,
      endMs: null,
      formattedSlot: "Chưa xếp giờ",
      hasValidTime: false,
    }
  }

  const cleanTime = (tStr: string) => {
    if (tStr.includes("T")) {
      try {
        const d = new Date(tStr)
        if (!isNaN(d.getTime())) {
          return d.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        }
      } catch {
        // fallback
      }
    }
    const parts = tStr.split(":")
    if (parts.length >= 2) {
      return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`
    }
    return tStr
  }

  let startMs: number | null = null
  let endMs: number | null = null

  // Try parsing full ISO timestamp
  if (startTimeStr.includes("T")) {
    try {
      const d = new Date(startTimeStr)
      if (!isNaN(d.getTime())) {
        startMs = d.getTime()
      }
    } catch {
      startMs = null
    }
  }

  // If no date in startTimeStr, combine dateStr and startTimeStr
  if (startMs === null) {
    const formattedDate = dateStr ? dateStr.split("T")[0] : "2000-01-01" // dummy fallback date for time comparison
    const formattedTime = cleanTime(startTimeStr)
    const combinedStr = `${formattedDate}T${formattedTime}:00`
    try {
      const d = new Date(combinedStr)
      if (!isNaN(d.getTime())) {
        startMs = d.getTime()
      }
    } catch {
      startMs = null
    }
  }

  if (startMs !== null) {
    // Parse or calculate endMs
    if (endTimeStr) {
      if (endTimeStr.includes("T")) {
        try {
          const dEnd = new Date(endTimeStr)
          if (!isNaN(dEnd.getTime())) {
            endMs = dEnd.getTime()
          }
        } catch {
          endMs = null
        }
      } else {
        const formattedDate = dateStr ? dateStr.split("T")[0] : "2000-01-01"
        const formattedEnd = cleanTime(endTimeStr)
        try {
          const dEnd = new Date(`${formattedDate}T${formattedEnd}:00`)
          if (!isNaN(dEnd.getTime())) {
            endMs = dEnd.getTime()
          }
        } catch {
          endMs = null
        }
      }
    }

    if (endMs === null || endMs <= startMs) {
      endMs = startMs + duration * 60 * 1000
    }
  }

  const formattedStart = cleanTime(startTimeStr)
  let formattedEnd = ""
  if (endMs && startMs) {
    const endDate = new Date(endMs)
    formattedEnd = endDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  }

  const slotTimeStr = formattedEnd
    ? `${formattedStart} - ${formattedEnd}`
    : formattedStart
  const slotDateStr = dateStr ? dateStr.split("T")[0] : ""
  const formattedSlot = slotDateStr
    ? `${slotDateStr} (${slotTimeStr})`
    : slotTimeStr

  return {
    matchId: match.id,
    startMs,
    endMs,
    formattedSlot,
    hasValidTime: startMs !== null && endMs !== null,
  }
}

/**
 * Checks if two match intervals overlap in time.
 */
export function isIntervalOverlapping(
  a: MatchTimeInterval,
  b: MatchTimeInterval
): boolean {
  if (!a.hasValidTime || !b.hasValidTime) return false
  if (
    a.startMs === null ||
    a.endMs === null ||
    b.startMs === null ||
    b.endMs === null
  ) {
    return false
  }
  return a.startMs < b.endMs && a.endMs > b.startMs
}

/**
 * Calculates peak concurrent matches across all matches to determine minimum referees required.
 */
export function calculatePeakConcurrentMatches(
  matches: AssignedReferee[],
  scheduleMap?: Record<string, TournamentSchedule>
): { peakCount: number; peakSlot: string } {
  const intervals = matches
    .map((m) => parseMatchInterval(m, scheduleMap))
    .filter(
      (inv) => inv.hasValidTime && inv.startMs !== null && inv.endMs !== null
    )

  if (intervals.length === 0) {
    return { peakCount: 0, peakSlot: "Chưa xác định" }
  }

  interface TimePoint {
    time: number
    type: number // -1 for end, +1 for start
    slot: string
  }

  const events: TimePoint[] = []
  for (const inv of intervals) {
    events.push({ time: inv.startMs!, type: 1, slot: inv.formattedSlot })
    events.push({ time: inv.endMs!, type: -1, slot: inv.formattedSlot })
  }

  // Sort events chronologically. If timestamps are equal, end (-1) before start (+1)
  events.sort((a, b) => {
    if (a.time !== b.time) return a.time - b.time
    return a.type - b.type
  })

  let currentConcurrent = 0
  let peakCount = 0
  let peakSlot = intervals[0].formattedSlot

  for (const ev of events) {
    currentConcurrent += ev.type
    if (currentConcurrent > peakCount) {
      peakCount = currentConcurrent
      peakSlot = ev.slot
    }
  }

  return { peakCount, peakSlot }
}

/**
 * Round-robin & workload-balanced referee auto-scheduler.
 */
export function autoScheduleReferees(
  referees: Referee[],
  allMatches: AssignedReferee[],
  scheduleMap?: Record<string, TournamentSchedule>
): AutoScheduleResult {
  const unassignedMatches = allMatches.filter(
    (m) => !m.refereeId || m.refereeId === ""
  )
  const assignedMatches = allMatches.filter((m) => Boolean(m.refereeId))

  // Calculate peak concurrent matches among ALL matches
  const { peakCount, peakSlot } = calculatePeakConcurrentMatches(
    allMatches,
    scheduleMap
  )
  const minRefereesRequired = Math.max(1, peakCount)
  const hasInsufficientReferees = referees.length < minRefereesRequired

  // Map to track existing assignments per referee
  const refereeIntervals: Record<string, MatchTimeInterval[]> = {}
  const initialWorkloads: Record<string, number> = {}

  for (const ref of referees) {
    refereeIntervals[ref.refereeId] = []
    // Count existing assigned matches from allMatches or ref.workload
    const existingCount = assignedMatches.filter(
      (m) => m.refereeId === ref.refereeId
    ).length
    initialWorkloads[ref.refereeId] = Math.max(existingCount, ref.workload || 0)
  }

  // Populate existing intervals for referees
  for (const match of assignedMatches) {
    if (match.refereeId && refereeIntervals[match.refereeId]) {
      refereeIntervals[match.refereeId].push(
        parseMatchInterval(match, scheduleMap)
      )
    }
  }

  // Sort unassigned matches by start time (valid start time first)
  const sortedUnassigned = [...unassignedMatches].sort((a, b) => {
    const invA = parseMatchInterval(a, scheduleMap)
    const invB = parseMatchInterval(b, scheduleMap)
    if (invA.hasValidTime && invB.hasValidTime) {
      return (invA.startMs ?? 0) - (invB.startMs ?? 0)
    }
    if (invA.hasValidTime) return -1
    if (invB.hasValidTime) return 1
    return 0
  })

  const newWorkloads: Record<string, number> = {}
  for (const ref of referees) {
    newWorkloads[ref.refereeId] = 0
  }

  const assignments: {
    matchId: string
    refereeId: string
    refereeName: string
  }[] = []
  const unassignableMatches: AssignedReferee[] = []

  let roundRobinCounter = 0

  for (const match of sortedUnassigned) {
    const matchInv = parseMatchInterval(match, scheduleMap)

    // Filter available referees without time conflict
    const candidateReferees = referees.filter((ref) => {
      const existingInvs = refereeIntervals[ref.refereeId] || []
      return !existingInvs.some((existingInv) =>
        isIntervalOverlapping(matchInv, existingInv)
      )
    })

    if (candidateReferees.length === 0) {
      unassignableMatches.push(match)
    } else {
      // Find min current workload among candidates
      const minWorkload = Math.min(
        ...candidateReferees.map(
          (ref) => initialWorkloads[ref.refereeId] + newWorkloads[ref.refereeId]
        )
      )

      // Filter candidates with min workload
      const bestCandidates = candidateReferees.filter(
        (ref) =>
          initialWorkloads[ref.refereeId] + newWorkloads[ref.refereeId] ===
          minWorkload
      )

      // Round-robin selection among best candidates
      const chosenReferee =
        bestCandidates[roundRobinCounter % bestCandidates.length]
      roundRobinCounter++

      // Record assignment
      assignments.push({
        matchId: match.id,
        refereeId: chosenReferee.refereeId,
        refereeName: chosenReferee.refereeName,
      })

      newWorkloads[chosenReferee.refereeId] += 1
      refereeIntervals[chosenReferee.refereeId].push(matchInv)
    }
  }

  const refereeWorkloads: RefereeWorkloadSummary[] = referees.map((ref) => {
    const initial = initialWorkloads[ref.refereeId] || 0
    const added = newWorkloads[ref.refereeId] || 0
    return {
      refereeId: ref.refereeId,
      refereeName: ref.refereeName,
      initialCount: initial,
      newCount: added,
      totalCount: initial + added,
    }
  })

  return {
    assignments,
    unassignableMatches,
    minRefereesRequired,
    peakConcurrentMatches: peakCount,
    peakSlot,
    refereeWorkloads,
    isFullyScheduled: unassignableMatches.length === 0,
    hasInsufficientReferees,
  }
}
