export type GuestMemberStatus = "PENDING" | "APPROVED" | "REJECTED"

export interface GuestMember {
  id: string
  fullName: string
  dateOfBirth: string
  gender: "MALE" | "FEMALE" | "OTHER" | null
  selfRating: number
  note: string
  status: GuestMemberStatus
  responsibleMemberId: string
  responsibleMemberName: string
  groupId: string
  createdAt: string
  approvedAt: string | null
  rejectedAt: string | null
}

export interface CreateGuestMemberInput {
  fullName: string
  dateOfBirth: string
  gender: "MALE" | "FEMALE" | "OTHER" | null
  selfRating: number
  note: string
}
