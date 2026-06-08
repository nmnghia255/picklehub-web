"use server"

import { SocialService } from "../api/social-service"
import type { LeaveSocialResponse } from "../types/social"

export async function leaveSocialAction(
  socialId: string
): Promise<LeaveSocialResponse> {
  return SocialService.leaveSocial(socialId)
}
