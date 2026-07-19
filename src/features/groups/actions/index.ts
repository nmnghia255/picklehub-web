"use server"

import axios from "axios"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import type { AcceptInvitationResponse } from "@/features/auth/types"
import { uploadFinanceReceiptFile } from "@/features/groups/api/finance-service"
import {
  archiveGroup,
  createGroup,
  createInviteLink,
  getInviteLinks,
  inviteToGroup,
  kickMember,
  leaveGroup,
  restoreGroup,
  revokeInvitation,
  revokeInviteLink,
  updateGroup,
} from "@/features/groups/api/groups-service"
import { getSession } from "@/lib/session"

import { addGroupSchema, inviteSchema } from "../schemas"
import type { InviteLink, InviteLinkResponse, UpdateGroupInput } from "../types"

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
        error: error.response?.data?.message || "errors.revokeInvitationFailed",
      }
    }
    return { error: "errors.defaultError" }
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
  const avatarFileField = formData.get("avatarFile")
  const avatarFile =
    avatarFileField instanceof File && avatarFileField.size > 0
      ? avatarFileField
      : null

  const parsed = addGroupSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    avatarUrl: formData.get("avatarUrl") || undefined,
  })

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  try {
    let avatarUrl = parsed.data.avatarUrl || undefined

    if (avatarFile) {
      const uploadResult = await uploadFinanceReceiptFile(avatarFile)
      avatarUrl = uploadResult.url
    }

    await createGroup({
      name: parsed.data.name,
      description: parsed.data.description,
      ...(avatarUrl ? { avatarUrl } : {}),
    })
    revalidatePath("/groups")
    return { success: true }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        error: error.response?.data?.message || "errors.createGroupFailed",
      }
    }
    return { error: "errors.defaultError" }
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
        error: error.response?.data?.message || "errors.sendInvitationFailed",
      }
    }
    return { error: "errors.defaultError" }
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
  const avatarUrlRaw = formData.get("avatarUrl")?.toString().trim()
  const maxMembersRaw = formData.get("maxMembers")?.toString()

  const avatarFileField = formData.get("avatarFile")
  const avatarFile =
    avatarFileField instanceof File && avatarFileField.size > 0
      ? avatarFileField
      : null

  let avatarUrl = avatarUrlRaw || undefined

  try {
    if (avatarFile) {
      const uploadResult = await uploadFinanceReceiptFile(avatarFile)
      avatarUrl = uploadResult.url
    }

    const payload: UpdateGroupInput = {
      ...(name ? { name } : {}),
      ...(description !== undefined
        ? { description: description.length > 0 ? description : null }
        : {}),
      ...(avatarUrl !== undefined
        ? { avatarUrl: avatarUrl.length > 0 ? avatarUrl : null }
        : {}),
      ...(maxMembersRaw ? { maxMembers: parseInt(maxMembersRaw, 10) } : {}),
    }

    if (Object.keys(payload).length === 0) {
      return { error: "errors.noInfoToUpdate" }
    }

    await updateGroup(groupId, payload)
    revalidatePath("/groups")
    revalidatePath(`/groups/${groupId}`)
    return { success: true }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        error: error.response?.data?.message || "errors.updateGroupFailed",
      }
    }
    return {
      error: error instanceof Error ? error.message : "errors.defaultError",
    }
  }
}

export async function archiveGroupAction(
  groupId: string,
  _prevState: GroupActionState,
  _formData: FormData
): Promise<GroupActionState> {
  try {
    await archiveGroup(groupId)
    revalidatePath("/groups")
    revalidatePath(`/groups/${groupId}`)
    return { success: true }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        error: error.response?.data?.message || "errors.archiveGroupFailed",
      }
    }
    return { error: "errors.defaultError" }
  }
}

export async function restoreGroupAction(
  groupId: string,
  _prevState: GroupActionState,
  _formData: FormData
): Promise<GroupActionState> {
  try {
    await restoreGroup(groupId)
    revalidatePath("/groups")
    revalidatePath(`/groups/${groupId}`)
    return { success: true }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        error: error.response?.data?.message || "dashboard.restoreGroupFailed",
      }
    }
    return { error: "errors.defaultError" }
  }
}

export async function kickMemberAction(
  _prevState: GroupMessageActionState,
  formData: FormData
): Promise<GroupMessageActionState> {
  const groupId = formData.get("groupId")?.toString() ?? ""
  const userId = formData.get("userId")?.toString() ?? ""

  if (!groupId || !userId) {
    return { error: "errors.missingMemberToDelete" }
  }

  try {
    const response = await kickMember(groupId, userId)
    revalidatePath(`/groups/${groupId}`)
    return { success: true, message: response.message }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        error: error.response?.data?.message || "errors.deleteMemberFailed",
      }
    }
    return { error: "errors.defaultError" }
  }
}

export async function leaveGroupAction(
  _prevState: GroupMessageActionState,
  formData: FormData
): Promise<GroupMessageActionState> {
  const groupId = formData.get("groupId")?.toString() ?? ""

  if (!groupId) {
    return { error: "errors.missingGroupToLeave" }
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
        error: error.response?.data?.message || "errors.leaveGroupFailed",
      }
    }
    return { error: "errors.defaultError" }
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
        error: error.response?.data?.message || "errors.createInviteLinkFailed",
      }
    }
    return { error: "errors.defaultError" }
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
        error: error.response?.data?.message || "errors.getInviteLinksFailed",
      }
    }
    return { error: "errors.defaultError" }
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
        error: error.response?.data?.message || "errors.revokeInviteLinkFailed",
      }
    }
    return { error: "errors.defaultError" }
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
    const { accessToken, refreshToken, isNewUser, user, group, expiresIn } =
      response.data as AcceptInvitationResponse & { expiresIn?: number }

    const session = await getSession()
    session.user = { id: user.id, email: user.email }
    session.accessToken = accessToken
    session.refreshToken = refreshToken
    session.accessTokenExpiresAt = Date.now() + (expiresIn ?? 900) * 1000
    await session.save()

    return { success: true, isNewUser, groupId: group.id }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        error: error.response?.data?.message || "errors.acceptInvitationFailed",
      }
    }
    return { error: "errors.defaultError" }
  }
}
