"use server"

import axios from "axios"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { kickMember, leaveGroup } from "@/features/groups/api/groups-service"

import type { GroupActionState } from "./group-actions"

export interface GroupMessageActionState extends GroupActionState {
  message?: string
}

export async function kickMemberAction(
  _prevState: GroupMessageActionState,
  formData: FormData
): Promise<GroupMessageActionState> {
  const groupId = formData.get("groupId")?.toString() ?? ""
  const userId = formData.get("userId")?.toString() ?? ""
  if (!groupId || !userId) return { error: "errors.missingMemberToDelete" }

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
  if (!groupId) return { error: "errors.missingGroupToLeave" }

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
