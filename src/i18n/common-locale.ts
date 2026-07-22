import type enCommon from "@/i18n/locales/en/common.json"
import type viCommon from "@/i18n/locales/vi/common.json"

export type CommonLocale = typeof enCommon | typeof viCommon

export type FriendCommonSection = {
  service: {
    friendBio: string
    userBio: string
    location: string
    loading: string
    requestSentBio: string
    requestReceivedBio: string
    inviteSource: string
  }
}

export type NotificationsCommonSection = {
  defaults: {
    title: string
    description: string
    actor: string
  }
  sender: {
    success: {
      description: string
    }
    error: {
      generic: string
    }
  }
}

export function getFriendCommonSection(
  common: CommonLocale
): FriendCommonSection {
  if ("friends" in common) {
    return common.friends as FriendCommonSection
  }

  return common.landing.friends as FriendCommonSection
}

export function getNotificationsCommonSection(
  common: CommonLocale
): NotificationsCommonSection {
  if ("notifications" in common) {
    return common.notifications as NotificationsCommonSection
  }

  return (
    common as unknown as {
      landing: { notifications: NotificationsCommonSection }
    }
  ).landing.notifications
}
