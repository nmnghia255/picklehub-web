import { getAuthenticatedAxios } from "@/lib/server-api"

import type { Feedback } from "../types/feedback"
import type {
  CreateInvitationResult,
  CreateSocialResponse,
  DuplicateSessionRequest,
  InvitationLinkData,
  InviteCodePreview,
  LeaveSocialResponse,
  ListSocial,
  ListSocialRequest,
  SocialDetail,
  SocialInvitation,
  SocialParticipant,
  UpdateSocialRequest,
} from "../types/social"

interface ApiResponse<T> {
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  message: string
  data: T
}

function unwrapApiResponse<T>(payload: ApiResponse<T> | T): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiResponse<T>).data
  }
  return payload as T
}

export const SocialService = {
  listMySocials: async function (
    tab: string | null,
    role: string | null,
    page: number | null,
    limit: number | null,
    status?: string | null,
    search?: string | null
  ): Promise<{
    data: ListSocial[]
    meta: ApiResponse<ListSocial[]>["meta"]
  }> {
    const axios = await getAuthenticatedAxios()
    const searchParams = new URLSearchParams()
    if (tab) searchParams.set("tab", tab)
    if (role) searchParams.set("role", role)
    if (status) searchParams.set("status", status)
    if (search) searchParams.set("search", search)
    if (page !== null) searchParams.set("page", page.toString())
    if (limit !== null) searchParams.set("limit", limit.toString())

    const response = await axios.get<ApiResponse<ListSocial[]>>(
      "/api/events/socials/my-schedule",
      { params: searchParams }
    )
    return { data: response.data.data, meta: response.data.meta }
  },

  createSocial: async function (
    payload: unknown
  ): Promise<CreateSocialResponse> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<CreateSocialResponse>>(
      "/api/events/socials",
      payload
    )
    return unwrapApiResponse(response.data)
  },

  discover: async function (params: ListSocialRequest): Promise<{
    data: ListSocial[]
    meta: ApiResponse<ListSocial[]>["meta"]
  }> {
    const axios = await getAuthenticatedAxios()
    const searchParams = new URLSearchParams()

    if (params.page) searchParams.set("page", params.page.toString())
    if (params.limit) searchParams.set("limit", params.limit.toString())

    if (params.search) searchParams.set("search", params.search)
    if (params.startFrom) searchParams.set("startFrom", params.startFrom)
    if (params.startTo) searchParams.set("startTo", params.startTo)
    if (params.upcoming)
      searchParams.set("upcoming", params.upcoming.toString())
    if (params.hasAvailableSlots)
      searchParams.set("hasAvailableSlots", params.hasAvailableSlots.toString())
    if (params.minimumLevel)
      searchParams.set("minimumLevel", params.minimumLevel.toString())
    if (params.maximumLevel)
      searchParams.set("maximumLevel", params.maximumLevel.toString())
    if (params.format) searchParams.set("format", params.format)
    if (params.genderPolicy)
      searchParams.set("genderPolicy", params.genderPolicy)
    if (params.ageGroup) searchParams.set("ageGroup", params.ageGroup)

    const response = await axios.get<ApiResponse<ListSocial[]>>(
      "/api/events/socials/discover",
      { params: searchParams }
    )
    return { data: response.data.data, meta: response.data.meta }
  },

  listAll: async function (): Promise<ListSocial[]> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<ListSocial[]>>(
      "/api/events/socials/all"
    )
    return unwrapApiResponse(response.data)
  },

  getSocial: async function (id: string): Promise<SocialDetail> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<SocialDetail>>(
      `/api/events/socials/${id}`
    )
    return unwrapApiResponse(response.data)
  },

  updateSocial: async function (
    id: string,
    payload: UpdateSocialRequest
  ): Promise<CreateSocialResponse> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.patch<ApiResponse<CreateSocialResponse>>(
      `/api/events/socials/${id}`,
      payload
    )
    return unwrapApiResponse(response.data)
  },

  deleteSocial: async function (id: string): Promise<{ message: string }> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.delete<ApiResponse<{ message: string }>>(
      `/api/events/socials/${id}`
    )
    return unwrapApiResponse(response.data)
  },

  publishSocial: async function (id: string): Promise<CreateSocialResponse> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.patch<ApiResponse<CreateSocialResponse>>(
      `/api/events/socials/${id}/publish`
    )
    return unwrapApiResponse(response.data)
  },

  duplicateSocial: async function (
    id: string,
    payload: DuplicateSessionRequest
  ): Promise<CreateSocialResponse> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<CreateSocialResponse>>(
      `/api/events/socials/${id}/duplicate`,
      payload
    )
    return unwrapApiResponse(response.data)
  },

  listSocialParticipants: async function (
    socialId: string,
    status?: string
  ): Promise<SocialParticipant[]> {
    const axios = await getAuthenticatedAxios()
    const searchParams = new URLSearchParams()
    if (status) searchParams.set("status", status)

    try {
      const response = await axios.get<ApiResponse<SocialParticipant[]>>(
        `/api/events/socials/${socialId}/participants`,
        { params: searchParams }
      )
      return unwrapApiResponse(response.data) ?? []
    } catch (error) {
      console.error("Error fetching social participants:", error)
      return []
    }
  },

  leaveSocial: async function (socialId: string): Promise<LeaveSocialResponse> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.delete<ApiResponse<LeaveSocialResponse>>(
      `/api/events/socials/${socialId}/participants/me`
    )
    return unwrapApiResponse(response.data)
  },

  approveJoinRequest: async function (
    socialId: string,
    participantId: string
  ): Promise<SocialParticipant> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.patch<ApiResponse<SocialParticipant>>(
      `/api/events/socials/${socialId}/participants/${participantId}/approve`
    )
    return unwrapApiResponse(response.data)
  },

  kickParticipant: async function (
    socialId: string,
    participantId: string
  ): Promise<SocialParticipant> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.delete<ApiResponse<SocialParticipant>>(
      `/api/events/socials/${socialId}/participants/${participantId}`
    )
    return unwrapApiResponse(response.data)
  },

  completeSocial: async function (socialId: string) {
    const axios = await getAuthenticatedAxios()
    const response = await axios.patch(
      `/api/events/socials/${socialId}/complete`
    )
    return unwrapApiResponse(response.data)
  },

  submitFeedback: async function (
    socialId: string,
    ratingOverall: number,
    ratingOrganization: number,
    ratingVenue: number,
    comment: string
  ) {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post(
      `/api/events/socials/${socialId}/feedback`,
      {
        ratingOverall,
        ratingOrganization,
        ratingVenue,
        comment,
      }
    )
    return unwrapApiResponse(response.data)
  },

  getFeedback: async function (socialId: string) {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<Feedback>>(
      `/api/events/socials/${socialId}/feedback/analytics`
    )
    return unwrapApiResponse(response.data)
  },

  getMyLastSettings: async function (): Promise<{
    paymentInfo: {
      paymentBankName: string | null
      paymentAccountName: string | null
      paymentAccountNumber: string | null
      paymentQrUrl: string | null
      paymentNote: string | null
    } | null
    policies: {
      genderPolicy: string
      ageGroup: string
      format: string
      minimumLevel: number
      maximumLevel: number
      submitDupr: boolean
      isFree: boolean
      autoApproveJoinRequests: boolean
      hostRole: string
      cancellationFreezeHours: number | null
    } | null
    defaultVenue: {
      centerId: string
      centerName: string
      location: string
      maxSlot: number
      numberOfCourts: number
      sessionFee: number
    } | null
  } | null> {
    try {
      const axios = await getAuthenticatedAxios()
      const response = await axios.get("/api/events/socials/my-last-settings")
      return response.data
    } catch {
      return null
    }
  },

  // ──────────────────────────────────────────────
  // Invitation System
  // ──────────────────────────────────────────────

  /**
   * API 1: Host gửi lời mời trực tiếp cho danh sách bạn bè
   * POST /api/events/socials/:socialId/invitations
   */
  sendDirectInvitations: async function (
    socialId: string,
    invitedUserIds: string[]
  ): Promise<CreateInvitationResult> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<CreateInvitationResult>>(
      `/api/events/socials/${socialId}/invitations`,
      { invitedUserIds }
    )
    return unwrapApiResponse(response.data)
  },

  /**
   * API 2: Host lấy link chia sẻ công khai
   * GET /api/events/socials/:socialId/invitations/link
   */
  getShareLink: async function (socialId: string): Promise<InvitationLinkData> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<InvitationLinkData>>(
      `/api/events/socials/${socialId}/invitations/link`
    )
    return unwrapApiResponse(response.data)
  },

  /**
   * API 3: Xem trước thông tin lời mời từ link chia sẻ (Public, dùng auth axios
   * vì trang social/:id đã nằm trong (protected) route group)
   * GET /api/events/socials/invitations/code/:inviteCode
   */
  previewInviteCode: async function (
    inviteCode: string
  ): Promise<InviteCodePreview> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<InviteCodePreview>>(
      `/api/events/socials/invitations/code/${inviteCode}`
    )
    return unwrapApiResponse(response.data)
  },

  /**
   * API 4: Đồng ý tham gia từ link chia sẻ
   * POST /api/events/socials/invitations/code/:inviteCode/accept
   */
  acceptByInviteCode: async function (
    inviteCode: string
  ): Promise<{
    inviteCode: string
    socialId: string
    participant: { id: string; status: string }
  }> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post(
      `/api/events/socials/invitations/code/${inviteCode}/accept`
    )
    return unwrapApiResponse(response.data)
  },

  /**
   * API 5: Chấp nhận lời mời trực tiếp
   * POST /api/events/socials/invitations/:invitationId/accept
   */
  acceptDirectInvitation: async function (
    invitationId: string
  ): Promise<{
    invitationId: string
    socialId: string
    participant: { id: string; status: string }
  }> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post(
      `/api/events/socials/invitations/${invitationId}/accept`
    )
    return unwrapApiResponse(response.data)
  },

  /**
   * API 6: Từ chối lời mời trực tiếp
   * POST /api/events/socials/invitations/:invitationId/decline
   */
  declineDirectInvitation: async function (
    invitationId: string
  ): Promise<{ invitationId: string; status: string }> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post(
      `/api/events/socials/invitations/${invitationId}/decline`
    )
    return unwrapApiResponse(response.data)
  },

  /**
   * API 7: Host xem danh sách lời mời đã gửi
   * GET /api/events/socials/:socialId/invitations
   */
  listSentInvitations: async function (
    socialId: string,
    status?: string
  ): Promise<SocialInvitation[]> {
    const axios = await getAuthenticatedAxios()
    const searchParams = new URLSearchParams()
    if (status) searchParams.set("status", status)

    try {
      const response = await axios.get<ApiResponse<SocialInvitation[]>>(
        `/api/events/socials/${socialId}/invitations`,
        { params: searchParams }
      )
      return unwrapApiResponse(response.data) ?? []
    } catch (error) {
      console.error("Error fetching sent invitations:", error)
      return []
    }
  },

  /**
   * API 8: Host hủy lời mời
   * DELETE /api/events/socials/:socialId/invitations/:invitationId
   */
  cancelInvitation: async function (
    socialId: string,
    invitationId: string
  ): Promise<{ invitationId: string; status: string }> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.delete(
      `/api/events/socials/${socialId}/invitations/${invitationId}`
    )
    return unwrapApiResponse(response.data)
  },
}
