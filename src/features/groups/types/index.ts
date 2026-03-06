export interface Group {
  id: string
  name: string
  description: string
  maxMembers: number | null
  memberCount: number
  role: string
  createdAt: string
}

export interface CreateGroupInput {
  name: string
  description: string
}

export interface Invitation {
  id: string
  email: string
  status: string
  expiresAt: string
  createdAt: string
}

export interface Member {
  userId: string
  name: string
  email: string
  role: string
  joinedAt: string
}

export interface InviteLink {
  id: string
  status: "pending" | "revoked"
  maxUses: number | null
  usedCount: number
  expiresAt: string
  createdAt: string
}

export interface InviteLinkResponse {
  token: string
  inviteUrl: string
  expiresAt: string
  maxUses: number | null
}
