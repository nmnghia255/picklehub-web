"use client"

import { getTeamASlots, getTeamBSlots } from "../constants/team-constants"
import { useScoreStore } from "../stores/use-score-store"
import { CourtSlot } from "./CourtSlot"

export function PickleballCourt() {
  const { playerNames, activeServer, isA1Right, isB1Right, isSwappedSides } =
    useScoreStore()

  const teamBSlots = getTeamBSlots(isB1Right)
  const teamASlots = getTeamASlots(isA1Right)

  const leftTopSlot = isSwappedSides ? teamBSlots.right : teamASlots.left
  const leftBottomSlot = isSwappedSides ? teamBSlots.left : teamASlots.right
  const rightTopSlot = isSwappedSides ? teamASlots.left : teamBSlots.right
  const rightBottomSlot = isSwappedSides ? teamASlots.right : teamBSlots.left

  const leftTeam = isSwappedSides ? "B" : "A"
  const rightTeam = isSwappedSides ? "A" : "B"

  return (
    <div className="relative flex flex-col justify-between border-2 bg-muted/20">
      <div className="absolute top-0 bottom-0 left-1/2 z-0 -translate-x-1/2">
        <div className="h-full w-2 bg-border" />
      </div>

      <div className="relative z-10 flex w-full flex-col">
        <div className="grid min-h-32 grid-cols-2">
          <div className="flex flex-1 items-center justify-center">
            <CourtSlot
              team={leftTeam}
              label={leftTopSlot.label}
              playerName={playerNames[leftTopSlot.id]}
              isServing={activeServer === leftTopSlot.id}
            />
          </div>
          <div className="flex flex-1 items-center justify-center">
            <CourtSlot
              team={rightTeam}
              label={rightTopSlot.label}
              playerName={playerNames[rightTopSlot.id]}
              isServing={activeServer === rightTopSlot.id}
            />
          </div>
        </div>

        <div className="h-0.5 w-full bg-border" />

        <div className="grid min-h-32 grid-cols-2">
          <div className="flex flex-1 items-center justify-center">
            <CourtSlot
              team={leftTeam}
              label={leftBottomSlot.label}
              playerName={playerNames[leftBottomSlot.id]}
              isServing={activeServer === leftBottomSlot.id}
            />
          </div>
          <div className="flex flex-1 items-center justify-center">
            <CourtSlot
              team={rightTeam}
              label={rightBottomSlot.label}
              playerName={playerNames[rightBottomSlot.id]}
              isServing={activeServer === rightBottomSlot.id}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
