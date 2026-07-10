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
  avatarUrl?: string | null
  guestCount?: number
}

export interface Equipment {
  id: string
  name: string
  description?: string | null
  quantity: number
  condition: "NEW" | "GOOD" | "WORN" | "RETIRED"
  purchaseCost: number
  purchasedAt: string
  groupId?: string
  isFavorite?: boolean
  deletedAt?: string | null
  createdById?: string
  createdAt: string
  updatedAt: string
  expense?: {
    id: string
    title: string
    totalAmount: number
  } | null
  myPayment?: {
    id: string
    requiredFee: number
    amountPaid: number
    outstandingFee: number
    status: string
  } | null
}

export interface CreateEquipmentInput {
  name: string
  description?: string
  quantity: number
  purchaseCost: number
  purchasedAt?: string
  condition?: "NEW" | "GOOD" | "WORN" | "RETIRED"
  createExpense?: boolean
  splitAmongAllMembers?: boolean
  memberIds?: string[]
}

export interface UpdateEquipmentInput {
  name?: string
  description?: string
  quantity?: number
  condition?: "NEW" | "GOOD" | "WORN" | "RETIRED"
}

export interface EquipmentFavorite {
  id: string
  groupId: string
  name: string
  defaultQuantity?: number | null
  defaultQuantityType?: "ALL" | "NUMBER" | null
  defaultCondition?: "NEW" | "GOOD" | "WORN" | "RETIRED" | null
  defaultCost?: number | null
  usageCount?: number
  isActive?: boolean
  createdAt: string
  updatedAt: string
}

export interface UpdateEquipmentFavoriteInput {
  name: string
  defaultQuantity?: number
  defaultQuantityType?: "ALL" | "NUMBER"
  defaultCondition?: "NEW" | "GOOD" | "WORN" | "RETIRED"
  defaultCost?: number
  isActive?: boolean
}

export interface EquipmentUsage {
  id: string
  groupId: string
  equipmentId: string
  quantityUsed: number
  note?: string | null
  usedAt: string
  loggedById: string
  createdAt: string
}

export interface PaginatedResponse<T> {
  message?: string
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type GroupMemberRole = "MEMBER"

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

export * from "./court-booking"
