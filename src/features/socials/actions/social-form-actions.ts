"use server"

import { revalidatePath } from "next/cache"

import { SocialService } from "@/features/socials/api/social-service"

import type { CreateSocialRequest, UpdateSocialRequest } from "../types/social"

export async function createSocialAction(data: CreateSocialRequest) {
  const result = await SocialService.createSocial(data)
  revalidatePath("/socials")
  return result
}

export async function updateSocialAction(
  id: string,
  data: UpdateSocialRequest
) {
  const result = await SocialService.updateSocial(id, data)
  revalidatePath("/socials")
  revalidatePath(`/socials/${id}`)
  return result
}

export async function deleteSocialAction(id: string) {
  const result = await SocialService.deleteSocial(id)
  revalidatePath("/socials")
  revalidatePath(`/socials/${id}`)
  return result
}

export async function publishSocialAction(id: string) {
  const result = await SocialService.publishSocial(id)
  revalidatePath("/socials")
  revalidatePath(`/socials/${id}`)
  return result
}
