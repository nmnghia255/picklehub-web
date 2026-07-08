import type {
  CoachScheduleApiItem,
  CoachScheduleApiProfile,
  CoachScheduleApiResponse,
  CoachScheduleItem,
  CoachScheduleParticipant,
  CoachScheduleResponse,
} from "../types/coach"

function getProfileName(profile?: CoachScheduleApiProfile | null) {
  return profile?.displayName ?? profile?.fullName ?? profile?.name ?? ""
}

function getProfileAvatar(profile?: CoachScheduleApiProfile | null) {
  return profile?.avatarUrl ?? profile?.avatar ?? null
}

function normalizeScheduleType(
  item: CoachScheduleApiItem
): "class" | "booking" {
  const kind = item.kind ?? item.type
  if (kind === "class" || kind === "booking") {
    return kind
  }

  if (item.bookingId && !item.classId) {
    return "booking"
  }

  return "class"
}

function normalizeLearners(
  item: CoachScheduleApiItem
): CoachScheduleParticipant[] {
  if (Array.isArray(item.learners) && item.learners.length > 0) {
    return item.learners.map((learner, index) => ({
      userId: learner.id ?? learner.userId ?? `${item.id}-learner-${index}`,
      name: getProfileName(learner),
      avatar: getProfileAvatar(learner),
    }))
  }

  if (item.learnerProfile) {
    return [
      {
        userId: item.learnerProfile.id ?? item.learnerProfile.userId ?? item.id,
        name: getProfileName(item.learnerProfile),
        avatar: getProfileAvatar(item.learnerProfile),
      },
    ]
  }

  return []
}

export function normalizeCoachScheduleItem(
  item: CoachScheduleApiItem
): CoachScheduleItem {
  const learners = normalizeLearners(item)
  const startTime = item.startsAt ?? item.startTime ?? ""
  const endTime = item.endsAt ?? item.endTime ?? startTime

  return {
    id: item.id,
    type: normalizeScheduleType(item),
    title: item.title,
    description: item.description ?? null,
    startTime,
    endTime,
    status:
      item.status === "upcoming" ||
      item.status === "live" ||
      item.status === "past" ||
      item.status === "pending"
        ? item.status
        : "pending",
    sourceStatus: item.sourceStatus ?? null,
    paymentStatus: item.paymentStatus ?? null,
    learners,
    classId: item.classId ?? null,
    bookingId: item.bookingId ?? null,
    location: item.locationDescription ?? item.location ?? null,
    meetingUrl: item.meetingUrl ?? null,
    learnerCount: item.learnerCount ?? learners.length,
    coachName: getProfileName(item.coachProfile) || null,
    learnerName:
      getProfileName(item.learnerProfile) || learners[0]?.name || null,
  }
}

export function normalizeCoachScheduleResponse(
  response: CoachScheduleApiResponse
): CoachScheduleResponse {
  return {
    success: response.success,
    data: Array.isArray(response.data)
      ? response.data.map((item) => normalizeCoachScheduleItem(item))
      : [],
    pagination: response.pagination,
    summary: response.summary,
    filters: response.filters,
  }
}
