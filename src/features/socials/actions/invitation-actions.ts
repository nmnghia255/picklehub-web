"use server"

import axios from "axios"
import { revalidatePath } from "next/cache"

import { listFriends } from "@/features/friend/api/friend-service"

import { SocialService } from "../api/social-service"

/**
 * Lấy danh sách bạn bè của user hiện tại
 */
export async function listFriendsAction() {
  return listFriends()
}

/**
 * Gửi lời mời trực tiếp cho danh sách bạn bè
 */
export async function sendDirectInvitationsAction(
  socialId: string,
  invitedUserIds: string[]
) {
  return SocialService.sendDirectInvitations(socialId, invitedUserIds)
}

/**
 * Lấy link chia sẻ công khai cho Social
 */
export async function getShareLinkAction(socialId: string) {
  return SocialService.getShareLink(socialId)
}

/**
 * Xem trước thông tin buổi chơi từ invite code
 */
export async function previewInviteCodeAction(inviteCode: string) {
  return SocialService.previewInviteCode(inviteCode)
}

function handleInvitationApiError(err: unknown): never {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status
    const data = err.response?.data as
      | { message?: string | string[] }
      | undefined
    const rawMsg = Array.isArray(data?.message)
      ? data.message.join(", ")
      : data?.message || ""

    if (status === 409) {
      if (
        rawMsg.toLowerCase().includes("already joined") ||
        rawMsg.toLowerCase().includes("participant")
      ) {
        throw new Error("invitation.alreadyJoined")
      }
      if (
        rawMsg.toLowerCase().includes("already accepted") ||
        rawMsg.toLowerCase().includes("invitation")
      ) {
        throw new Error("invitation.alreadyAccepted")
      }
      throw new Error("invitation.conflictError")
    }

    if (status === 404) {
      throw new Error("invitation.notFound")
    }

    if (status === 403) {
      throw new Error("invitation.forbidden")
    }

    if (rawMsg) {
      throw new Error(rawMsg)
    }
  }

  if (err instanceof Error) {
    throw err
  }

  throw new Error("invitation.acceptError")
}

/**
 * Chấp nhận tham gia qua link chia sẻ
 */
export async function acceptByInviteCodeAction(
  inviteCode: string,
  socialId: string
) {
  try {
    const result = await SocialService.acceptByInviteCode(inviteCode)
    revalidatePath(`/socials/${socialId}`)
    return result
  } catch (err) {
    handleInvitationApiError(err)
  }
}

/**
 * Chấp nhận lời mời trực tiếp (từ notification)
 */
export async function acceptDirectInvitationAction(
  invitationId: string,
  socialId?: string
) {
  try {
    const result = await SocialService.acceptDirectInvitation(invitationId)
    if (socialId) {
      revalidatePath(`/socials/${socialId}`)
    }
    return result
  } catch (err) {
    handleInvitationApiError(err)
  }
}

/**
 * Từ chối lời mời trực tiếp (từ notification)
 */
export async function declineDirectInvitationAction(
  invitationId: string,
  socialId?: string
) {
  try {
    const result = await SocialService.declineDirectInvitation(invitationId)
    if (socialId) {
      revalidatePath(`/socials/${socialId}`)
    }
    return result
  } catch (err) {
    handleInvitationApiError(err)
  }
}

/**
 * Xem danh sách lời mời đã gửi (Host view)
 */
export async function listSentInvitationsAction(
  socialId: string,
  status?: string
) {
  return SocialService.listSentInvitations(socialId, status)
}

/**
 * Host hủy lời mời (API 8)
 */
export async function cancelInvitationAction(
  socialId: string,
  invitationId: string
) {
  const result = await SocialService.cancelInvitation(socialId, invitationId)
  revalidatePath(`/socials/${socialId}`)
  return result
}
