import type { SocialParticipant } from "../types/social"

async function apiRequest<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  })

  const payload = (await response.json().catch(() => ({}))) as {
    message?: string
    data?: T
  }

  if (!response.ok) {
    throw new Error(payload.message || "Request failed")
  }

  return (payload.data ?? payload) as T
}

export async function leaveSocialAction(
  socialId: string
): Promise<SocialParticipant> {
  return apiRequest<SocialParticipant>(
    `/api/events/socials/${socialId}/leave`,
    {
      method: "DELETE",
    }
  )
}
