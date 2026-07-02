export interface ConfigureGroupStageRequest {
  numGroups: number
  advancePerGroup: number
  advanceMethod: string
  totalAdvance: number // number of teams advancing to the knockout stage
}

export interface GroupMembership {
  id: number
  groupId: number
  teamId: number
  teamName: string
  seed: number
  wins: number
  draws: number
  losses: number
  points: number
  gameDiff: number
  isAdvanced: boolean
  team?: {
    id: number
    name: string
  }
}

export interface DrawGroupsRequest {
  force?: boolean
  priorityTeamIds?: number[]
}

export interface Group {
  id: number
  name: string
  order: number
  memberships: GroupMembership[]
}

export interface GenerateMatchesResponse {
  success: boolean
}

export interface AdvanceTeamsRequest {
  totalAdvance: number
}

export interface AdvanceTeamsResponse {
  advancedTeamsCount: number
}
