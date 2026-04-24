"use server"

import axios from "axios"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import {
  archiveGroup,
  changeMemberRole,
  createGroup,
  createInviteLink,
  getInviteLinks,
  inviteToGroup,
  kickMember,
  leaveGroup,
  revokeInvitation,
  revokeInviteLink,
  updateGroup,
} from "@/features/groups/api/groups-service"
import { getSession } from "@/lib/session"

import { addGroupSchema, inviteSchema } from "../schemas"
import type {
  GroupMemberRole,
  InviteLink,
  InviteLinkResponse,
  UpdateGroupInput,
} from "../types"

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
    revalidatePath(`/groups/${groupId}`)
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

export interface GroupMessageActionState extends GroupActionState {
  message?: string
}

export async function updateGroupAction(
  groupId: string,
  _prevState: GroupActionState,
  formData: FormData
): Promise<GroupActionState> {
  const name = formData.get("name")?.toString().trim()
  const description = formData.get("description")?.toString().trim()
  const avatarUrl = formData.get("avatarUrl")?.toString().trim()

  const payload: UpdateGroupInput = {
    ...(name ? { name } : {}),
    ...(description !== undefined
      ? { description: description.length > 0 ? description : null }
      : {}),
    ...(avatarUrl !== undefined
      ? { avatarUrl: avatarUrl.length > 0 ? avatarUrl : null }
      : {}),
  }

  if (Object.keys(payload).length === 0) {
    return { error: "Không có thông tin nào để cập nhật." }
  }

  try {
    await updateGroup(groupId, payload)
    revalidatePath("/groups")
    revalidatePath(`/groups/${groupId}`)
    return { success: true }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        error:
          error.response?.data?.message ||
          "Cập nhật nhóm thất bại. Vui lòng thử lại.",
      }
    }
    return { error: "Đã có lỗi xảy ra. Vui lòng thử lại." }
  }
}

export async function changeMemberRoleAction(
  _prevState: GroupActionState,
  formData: FormData
): Promise<GroupActionState> {
  const groupId = formData.get("groupId")?.toString() ?? ""
  const memberId = formData.get("memberId")?.toString() ?? ""
  const role = formData.get("role")?.toString() as GroupMemberRole | null

  if (!groupId || !memberId || !role) {
    return { error: "Thiếu thông tin cập nhật vai trò thành viên." }
  }

  try {
    await changeMemberRole(groupId, memberId, { role })
    revalidatePath(`/groups/${groupId}`)
    return { success: true }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        error:
          error.response?.data?.message ||
          "Cập nhật vai trò thành viên thất bại. Vui lòng thử lại.",
      }
    }
    return { error: "Đã có lỗi xảy ra. Vui lòng thử lại." }
  }
}

export async function kickMemberAction(
  _prevState: GroupMessageActionState,
  formData: FormData
): Promise<GroupMessageActionState> {
  const groupId = formData.get("groupId")?.toString() ?? ""
  const userId = formData.get("userId")?.toString() ?? ""

  if (!groupId || !userId) {
    return { error: "Thiếu thông tin thành viên cần xóa." }
  }

  try {
    const response = await kickMember(groupId, userId)
    revalidatePath(`/groups/${groupId}`)
    return { success: true, message: response.message }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        error:
          error.response?.data?.message ||
          "Xóa thành viên thất bại. Vui lòng thử lại.",
      }
    }
    return { error: "Đã có lỗi xảy ra. Vui lòng thử lại." }
  }
}

export async function leaveGroupAction(
  _prevState: GroupMessageActionState,
  formData: FormData
): Promise<GroupMessageActionState> {
  const groupId = formData.get("groupId")?.toString() ?? ""

  if (!groupId) {
    return { error: "Thiếu thông tin nhóm cần rời." }
  }

  try {
    await leaveGroup(groupId)
    revalidatePath("/groups")
    redirect("/groups")
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof (error as { digest?: unknown }).digest === "string" &&
      (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error
    }

    if (axios.isAxiosError(error)) {
      return {
        error:
          error.response?.data?.message ||
          "Rời nhóm thất bại. Vui lòng thử lại.",
      }
    }
    return { error: "Đã có lỗi xảy ra. Vui lòng thử lại." }
  }
}

export async function archiveGroupAction(
  groupId: string
): Promise<GroupActionState> {
  try {
    await archiveGroup(groupId)
    revalidatePath("/groups")
    revalidatePath(`/groups/${groupId}`)
    return { success: true }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        error:
          error.response?.data?.message ||
          "Lưu trữ nhóm thất bại. Vui lòng thử lại.",
      }
    }
    return { error: "Đã có lỗi xảy ra. Vui lòng thử lại." }
  }
}

/** @deprecated */
export interface InviteLinkActionState {
  data?: InviteLinkResponse
  error?: string
}

/** @deprecated */
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

/** @deprecated */
export interface GetInviteLinksActionState {
  data?: InviteLink[]
  error?: string
}

/** @deprecated */
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

/** @deprecated */
export interface RevokeInviteLinkActionState {
  error?: string
  success?: boolean
}

/** @deprecated */
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
