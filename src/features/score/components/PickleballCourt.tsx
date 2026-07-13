"use client"

import { useMemo } from "react"

import { getTeamASlots, getTeamBSlots } from "../constants/team-constants"
import { useScoreStore } from "../stores/use-score-store"
import { CourtSlot } from "./CourtSlot"

export function PickleballCourt() {
  const {
    playerNames,
    activeServer,
    isA1Right,
    isB1Right,
    isSwappedSides,
    isDoubles,
    servingTeam,
  } = useScoreStore()

  const teamBSlots = getTeamBSlots(isB1Right)
  const teamASlots = getTeamASlots(isA1Right)

  const leftTopSlot = isSwappedSides ? teamBSlots.left : teamASlots.left
  const leftBottomSlot = isSwappedSides ? teamBSlots.right : teamASlots.right
  const rightTopSlot = isSwappedSides ? teamASlots.right : teamBSlots.right
  const rightBottomSlot = isSwappedSides ? teamASlots.left : teamBSlots.left

  const leftTeam = "A"
  const rightTeam = "B"

  // Calculate receiver player ID
  const receiverId = useMemo(() => {
    if (!isDoubles) {
      return servingTeam === "A" ? "B1" : "A1"
    }

    const serverIsRight =
      servingTeam === "A"
        ? activeServer === "A1"
          ? isA1Right
          : !isA1Right
        : activeServer === "B1"
          ? isB1Right
          : !isB1Right

    if (servingTeam === "A") {
      return isB1Right
        ? serverIsRight
          ? "B1"
          : "B2"
        : serverIsRight
          ? "B2"
          : "B1"
    } else {
      return isA1Right
        ? serverIsRight
          ? "A1"
          : "A2"
        : serverIsRight
          ? "A2"
          : "A1"
    }
  }, [servingTeam, activeServer, isA1Right, isB1Right, isDoubles])

  return (
    <div className="relative min-h-[340px] w-full overflow-hidden rounded-2xl border-4 border-white bg-[#2c7a4b] shadow-lg select-none">
      {/* Outer court boundaries & colors */}
      <div className="absolute inset-2 border-2 border-white/90 bg-[#1e5a38]">
        {/* Left Side NVZ (Kitchen) line */}
        <div className="absolute top-0 bottom-0 left-[35%] w-0.5 bg-white/90" />

        {/* Right Side NVZ (Kitchen) line */}
        <div className="absolute top-0 right-[35%] bottom-0 w-0.5 bg-white/90" />

        {/* Shaded NVZ / Kitchen Center Zone */}
        <div className="absolute top-0 right-[35%] bottom-0 left-[35%] flex items-center justify-center bg-[#1b4e31]/80">
          <span className="vertical-text text-[10px] font-black tracking-[0.3em] text-white/10 uppercase select-none sm:text-xs">
            Non-Volley Zone (Kitchen)
          </span>
        </div>

        {/* Net line (exact middle) */}
        <div className="absolute top-0 bottom-0 left-1/2 z-20 flex w-1 -translate-x-1/2 flex-col items-center justify-between bg-neutral-800 py-1">
          <div className="-mt-2 size-2.5 rounded-full border border-white/50 bg-neutral-900" />
          <div className="h-full w-0.5 border-r border-dashed border-white/30" />
          <div className="-mb-2 size-2.5 rounded-full border border-white/50 bg-neutral-900" />
        </div>

        {/* Center Lines for Service Courts */}
        {/* Left Side centerline */}
        <div className="absolute top-1/2 right-[65%] left-0 h-0.5 -translate-y-1/2 bg-white/90" />
        {/* Right Side centerline */}
        <div className="absolute top-1/2 right-0 left-[65%] h-0.5 -translate-y-1/2 bg-white/90" />
      </div>

      {/* Interactive Court Slots grid */}
      <div className="relative z-10 grid min-h-[332px] grid-cols-2 p-3">
        {/* Left Side Team Slots */}
        <div className="flex flex-col justify-between py-4 pr-12">
          <div className="flex flex-1 items-center justify-center">
            <CourtSlot
              team={leftTeam}
              label={leftTopSlot.label}
              playerName={playerNames[leftTopSlot.id]}
              isServing={activeServer === leftTopSlot.id}
              isReceiving={receiverId === leftTopSlot.id}
            />
          </div>
          <div className="flex flex-1 items-center justify-center">
            <CourtSlot
              team={leftTeam}
              label={leftBottomSlot.label}
              playerName={playerNames[leftBottomSlot.id]}
              isServing={activeServer === leftBottomSlot.id}
              isReceiving={receiverId === leftBottomSlot.id}
            />
          </div>
        </div>

        {/* Right Side Team Slots */}
        <div className="flex flex-col justify-between py-4 pl-12">
          <div className="flex flex-1 items-center justify-center">
            <CourtSlot
              team={rightTeam}
              label={rightTopSlot.label}
              playerName={playerNames[rightTopSlot.id]}
              isServing={activeServer === rightTopSlot.id}
              isReceiving={receiverId === rightTopSlot.id}
            />
          </div>
          <div className="flex flex-1 items-center justify-center">
            <CourtSlot
              team={rightTeam}
              label={rightBottomSlot.label}
              playerName={playerNames[rightBottomSlot.id]}
              isServing={activeServer === rightBottomSlot.id}
              isReceiving={receiverId === rightBottomSlot.id}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
