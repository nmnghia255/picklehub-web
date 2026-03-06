"use server"

import axios from "axios"
import { revalidatePath } from "next/cache"

import {
  createGroup,
  createInviteLink,
  getInviteLinks,
  inviteToGroup,
  revokeInvitation,
  revokeInviteLink,
} from "@/features/groups/api/groups-service"
import { getSession } from "@/lib/session"

import { addGroupSchema, inviteSchema } from "../schemas"
import type { InviteLink, InviteLinkResponse } from "../types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || ""

export interface RevokeInvitationActionState {
  error?: string
  success?: boolean
}

export async function revokeInvitationAction(
  groupId: string,
  invitationId: string
): Promise<RevokeInvitationActionState> {
  try {
    await revokeInvitation(groupId, invitationId)
    revalidatePath(`/groups/${groupId}`)
    return { success: true }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        error:
          error.response?.data?.message ||
          "Revoke lời mời thất bại. Vui lòng thử lại.",
      }
    }
    return { error: "Đã có lỗi xảy ra. Vui lòng thử lại." }
  }
}

export interface GroupActionState {
  error?: string
  success?: boolean
}

export async function addGroupAction(
  _prevState: GroupActionState,
  formData: FormData
): Promise<GroupActionState> {
  const parsed = addGroupSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  })

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  try {
    await createGroup(parsed.data)
    revalidatePath("/groups")
    return { success: true }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        error:
          error.response?.data?.message ||
          "Tạo nhóm thất bại. Vui lòng thử lại.",
      }
    }
    return { error: "Đã có lỗi xảy ra. Vui lòng thử lại." }
  }
}

export async function inviteToGroupAction(
  groupId: string,
  _prevState: GroupActionState,
  formData: FormData
): Promise<GroupActionState> {
  const parsed = inviteSchema.safeParse({
    email: formData.get("email"),
  })

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  try {
    await inviteToGroup(groupId, parsed.data.email)
    return { success: true }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        error:
          error.response?.data?.message ||
          "Gửi lời mời thất bại. Vui lòng thử lại.",
      }
    }
    return { error: "Đã có lỗi xảy ra. Vui lòng thử lại." }
  }
}

export interface InviteLinkActionState {
  data?: InviteLinkResponse
  error?: string
}

export async function createInviteLinkAction(
  groupId: string
): Promise<InviteLinkActionState> {
  try {
    const data = await createInviteLink(groupId)
    return { data }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        error:
          error.response?.data?.message ||
          "Tạo invite link thất bại. Vui lòng thử lại.",
      }
    }
    return { error: "Đã có lỗi xảy ra. Vui lòng thử lại." }
  }
}

export interface GetInviteLinksActionState {
  data?: InviteLink[]
  error?: string
}

export async function getInviteLinksAction(
  groupId: string
): Promise<GetInviteLinksActionState> {
  try {
    const data = await getInviteLinks(groupId)
    return { data }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        error:
          error.response?.data?.message ||
          "Lấy danh sách invite links thất bại.",
      }
    }
    return { error: "Đã có lỗi xảy ra. Vui lòng thử lại." }
  }
}

export interface RevokeInviteLinkActionState {
  error?: string
  success?: boolean
}

export async function revokeInviteLinkAction(
  groupId: string,
  linkId: string
): Promise<RevokeInviteLinkActionState> {
  try {
    await revokeInviteLink(groupId, linkId)
    return { success: true }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        error:
          error.response?.data?.message ||
          "Revoke invite link thất bại. Vui lòng thử lại.",
      }
    }
    return { error: "Đã có lỗi xảy ra. Vui lòng thử lại." }
  }
}

// ============================================
// Accept Invitation
// ============================================

export interface AcceptInvitationActionState {
  success?: boolean
  isNewUser?: boolean
  groupId?: string
  error?: string
}

export async function acceptInvitationAction(
  token: string
): Promise<AcceptInvitationActionState> {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/invitations/${token}/accept`
    )
    const { accessToken, refreshToken, isNewUser, user, group } = response.data

    const session = await getSession()
    session.user = { id: user.id, email: user.email }
    session.accessToken = accessToken
    session.refreshToken = refreshToken
    await session.save()

    return { success: true, isNewUser, groupId: group.id }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        error:
          error.response?.data?.message ||
          "Chấp nhận lời mời thất bại. Vui lòng thử lại.",
      }
    }
    return { error: "Đã có lỗi xảy ra. Vui lòng thử lại." }
  }
}
