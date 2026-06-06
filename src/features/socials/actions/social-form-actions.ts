"use server"

import { SocialService } from "../api/social-service"
import type { CreateSocialRequest, UpdateSocialRequest } from "../types/social"

export async function createSocialAction(data: CreateSocialRequest) {
  return SocialService.createSocial(data)
}

export async function updateSocialAction(
  id: string,
  data: UpdateSocialRequest
) {
  return SocialService.updateSocial(id, data)
}

export async function deleteSocialAction(id: string) {
  return SocialService.deleteSocial(id)
}

export async function publishSocialAction(id: string) {
  return SocialService.publishSocial(id)
}
