"use server"

import axios from "axios"
import { revalidatePath } from "next/cache"

import { uploadFinanceReceiptFile } from "@/features/groups/api/finance-service"
import {
  archiveGroup,
  createGroup,
  restoreGroup,
  updateGroup,
} from "@/features/groups/api/groups-service"

import { addGroupSchema } from "../schemas"
import type { UpdateGroupInput } from "../types"

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

  if (!parsed.success) return { error: parsed.error.errors[0].message }

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
