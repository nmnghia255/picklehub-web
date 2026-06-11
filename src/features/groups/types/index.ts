export type GroupStatus = "ACTIVE" | "GRACE_PERIOD" | "FROZEN" | "ARCHIVED"

export interface Group {
  id: string
  name: string
  description: string | null
  avatarUrl?: string | null
  maxMembers: number | null
  memberCount: number
  role: string
  status?: GroupStatus
  createdAt: string
}

export interface CreateGroupInput {
  name: string
  description: string
}

export interface UpdateGroupInput {
  name?: string
  description?: string | null
  avatarUrl?: string | null
  maxMembers?: number
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

export type GroupMemberRole = "ADMIN" | "MEMBER"

export interface ChangeMemberRoleInput {
  role: GroupMemberRole
}

export interface ChangeMemberRoleResponse {
  userId: string
  role: string
}

export interface GroupMemberActionResponse {
  message: string
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
