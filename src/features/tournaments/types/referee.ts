export interface RefereeRequest {
  refereeId: string
  refereeName: string
  refereeEmail: string
  refereeAvatar: string
  phone: string
}

export interface Referee extends RefereeRequest {
  id: number
  enrolledAt: string
  workload: number
}

export interface AssignedReferee {
  id: string
  tournamentId: string
  eventId: string
  round: string
  team1Id: string
  team2Id: string
  winner: string
  score: string
  status: string
  courtId: string
  time: string
  startTime: string
  duration: number
  priority: string
  refereeId: string
  refereeName: string
  event: {
    name: string
    type: string
  }
  court: {
    name: string
  }
}
