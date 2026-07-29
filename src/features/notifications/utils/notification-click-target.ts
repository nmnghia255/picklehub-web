type NotificationClickSupport = {
  type?: unknown
  conversationId?: unknown
  messageId?: unknown
  groupId?: unknown
  socialId?: unknown
  invitationId?: unknown
  tournamentId?: unknown
  bookingId?: unknown
  coachProfileId?: unknown
  coachId?: unknown
  tab?: unknown
  requestId?: unknown
  userId?: unknown
  href?: unknown
}

function getString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null
}

function getClickSupport(metadata: unknown): NotificationClickSupport | null {
  if (!metadata || typeof metadata !== "object") return null

  const value = (metadata as Record<string, unknown>).onClickSupport

  if (!value || typeof value !== "object") return null

  return value as NotificationClickSupport
}

function getSafeInternalHref(value: unknown) {
  const href = getString(value)

  if (!href) return null
  if (!href.startsWith("/") || href.startsWith("//")) return null
  if (!isSupportedNotificationHref(href)) return null

  return href
}

function isSupportedNotificationHref(href: string) {
  const [pathname] = href.split(/[?#]/, 1)

  return (
    pathname === "/chat" ||
    pathname === "/feed" ||
    pathname === "/friend" ||
    pathname.startsWith("/groups/") ||
    pathname.startsWith("/socials/") ||
    pathname.startsWith("/tournaments/") ||
    pathname.startsWith("/bookings/") ||
    pathname.startsWith("/coaches/") ||
    pathname.startsWith("/sport-center/")
  )
}

export function deriveNotificationActionHref(metadata: unknown) {
  const onClickSupport = getClickSupport(metadata)

  if (!onClickSupport) return undefined

  const directHref = getSafeInternalHref(onClickSupport.href)
  if (directHref) return directHref

  const type = getString(onClickSupport.type)
  const conversationId = getString(onClickSupport.conversationId)
  const messageId = getString(onClickSupport.messageId)
  const groupId = getString(onClickSupport.groupId)
  const socialId = getString(onClickSupport.socialId)
  const tournamentId = getString(onClickSupport.tournamentId)
  const bookingId = getString(onClickSupport.bookingId)
  const friendTab = getString(onClickSupport.tab)
  const coachId =
    getString(onClickSupport.coachProfileId) ??
    getString(onClickSupport.coachId)

  if (type === "chat" && conversationId) {
    const params = new URLSearchParams({ conversationId })
    if (messageId) params.set("messageId", messageId)
    return `/chat?${params.toString()}`
  }

  if (type === "group" && groupId) return `/groups/${groupId}`
  if (type === "social" && socialId) {
    const invitationId = getString(onClickSupport.invitationId)
    const params = new URLSearchParams()
    if (invitationId) params.set("invitationId", invitationId)
    return params.size > 0
      ? `/socials/${socialId}?${params.toString()}`
      : `/socials/${socialId}`
  }
  if (type === "tournament" && tournamentId)
    return `/tournaments/${tournamentId}`
  if (type === "booking" && bookingId) return `/bookings/${bookingId}`
  if (type === "coach" && coachId) return `/coaches/${coachId}`
  if (type === "friend") {
    const tab =
      friendTab === "received" ||
      friendTab === "sent" ||
      friendTab === "friends"
        ? friendTab
        : "friends"
    return `/friend?tab=${tab}`
  }

  if (conversationId) {
    const params = new URLSearchParams({ conversationId })
    if (messageId) params.set("messageId", messageId)
    return `/chat?${params.toString()}`
  }

  if (groupId) return `/groups/${groupId}`
  if (socialId) {
    const invitationId = getString(onClickSupport.invitationId)
    const params = new URLSearchParams()
    if (invitationId) params.set("invitationId", invitationId)
    return params.size > 0
      ? `/socials/${socialId}?${params.toString()}`
      : `/socials/${socialId}`
  }
  if (tournamentId) return `/tournaments/${tournamentId}`
  if (bookingId) return `/bookings/${bookingId}`
  if (coachId) return `/coaches/${coachId}`

  return undefined
}
