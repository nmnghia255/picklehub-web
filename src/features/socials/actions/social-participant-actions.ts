"use server"

import { SocialService } from "../api/social-service"

export async function listSocialParticipantsAction(
  socialId: string,
  status?: string
) {
  return SocialService.listSocialParticipants(socialId, status)
}

export async function approveParticipantAction(
  socialId: string,
  participantId: string
) {
  return SocialService.approveJoinRequest(socialId, participantId)
}

export async function kickParticipantAction(
  socialId: string,
  participantId: string
) {
  return SocialService.kickParticipant(socialId, participantId)
}
