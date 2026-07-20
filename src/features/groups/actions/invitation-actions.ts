"use server"

import axios from "axios"
import { revalidatePath } from "next/cache"

import type { AcceptInvitationResponse } from "@/features/auth/types"
import { getSession } from "@/lib/session"

import {
  createInviteLink,
  getInviteLinks,
  inviteToGroup,
  revokeInvitation,
  revokeInviteLink,
} from "../api/groups-service"
import { inviteSchema } from "../schemas"
import type { InviteLink, InviteLinkResponse } from "../types"
import type { GroupActionState } from "./group-actions"

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

export async function inviteToGroupAction(
  groupId: string,
  _prevState: GroupActionState,
  formData: FormData
): Promise<GroupActionState> {
  const parsed = inviteSchema.safeParse({ email: formData.get("email") })
  if (!parsed.success) return { error: parsed.error.errors[0].message }

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
    return { data: await createInviteLink(groupId) }
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
    return { data: await getInviteLinks(groupId) }
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
