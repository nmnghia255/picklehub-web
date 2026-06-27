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

export interface Referee {
  refereeId: string
  refereeName: string
}
