"use client"

import { Undo2 } from "lucide-react"
import { useState } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type Team = "A" | "B"
type ServerId = "A1" | "A2" | "B1" | "B2"
type ServerOrdinal = 1 | 2

type GameSnapshot = {
  teamAScore: number
  teamBScore: number
  servingTeam: Team
  serverNumber: ServerOrdinal
  isA1Right: boolean
  isB1Right: boolean
  activeServer: ServerId
}

const TEAM_COLOR = {
  A: {
    score: "text-blue-600 dark:text-blue-600",
    chip: "bg-blue-600 text-white",
    servingDot: "bg-blue-500",
    servingRing: "ring-blue-500",
    actionButton: "bg-blue-600 text-white hover:bg-blue-500",
    actionHint: "text-white/80",
  },
  B: {
    score: "text-emerald-600 dark:text-emerald-400",
    chip: "bg-emerald-600 text-white",
    servingDot: "bg-emerald-500",
    servingRing: "ring-emerald-500",
    actionButton: "bg-emerald-600 text-white hover:bg-emerald-500",
    actionHint: "text-white/80",
  },
} as const

function getTeamASlots(isA1Right: boolean) {
  return {
    left: {
      id: (isA1Right ? "A2" : "A1") as ServerId,
      label: isA1Right ? "A2" : "A1",
    },
    right: {
      id: (isA1Right ? "A1" : "A2") as ServerId,
      label: isA1Right ? "A1" : "A2",
    },
  }
}

function getTeamBSlots(isB1Right: boolean) {
  return {
    left: {
      id: (isB1Right ? "B2" : "B1") as ServerId,
      label: isB1Right ? "B2" : "B1",
    },
    right: {
      id: (isB1Right ? "B1" : "B2") as ServerId,
      label: isB1Right ? "B1" : "B2",
    },
  }
}

type CourtSlotProps = {
  team: Team
  label: string
  isServing: boolean
}

function CourtSlot({ team, label, isServing }: CourtSlotProps) {
  const teamColor = TEAM_COLOR[team]

  return (
    <div
      data-team={team}
      className={cn(
        "group/player relative flex min-w-30 flex-col items-center gap-2 p-4 ring-2 ring-transparent transition-all",
        isServing ? cn("bg-card", teamColor.servingRing) : null
      )}
    >
      <div
        className={cn(
          "flex size-12 items-center justify-center rounded-full text-lg font-semibold",
          teamColor.chip
        )}
      >
        {label}
      </div>

      <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
        {`VĐV ${label}`}
      </span>

      {isServing && (
        <span
          className={cn(
            "absolute top-1/2 inline-block size-3 shrink-0 -translate-y-1/2 animate-pulse rounded-full",
            "group-data-[team=A]/player:-right-5",
            "group-data-[team=B]/player:-left-5",
            teamColor.servingDot
          )}
          aria-hidden
        />
      )}
    </div>
  )
}

function PickleballTracker() {
  const [teamAScore, setTeamAScore] = useState(0)
  const [teamBScore, setTeamBScore] = useState(0)
  const [servingTeam, setServingTeam] = useState<Team>("A")
  const [serverNumber, setServerNumber] = useState<ServerOrdinal>(2)
  const [isA1Right, setIsA1Right] = useState(true)
  const [isB1Right, setIsB1Right] = useState(true)
  const [activeServer, setActiveServer] = useState<ServerId>("A1")
  const [history, setHistory] = useState<GameSnapshot[]>([])

  const saveHistory = () => {
    setHistory((prev) => [
      ...prev,
      {
        teamAScore,
        teamBScore,
        servingTeam,
        serverNumber,
        isA1Right,
        isB1Right,
        activeServer,
      },
    ])
  }

  const handleRallyWin = (winningTeam: Team) => {
    saveHistory()

    if (winningTeam === servingTeam) {
      if (servingTeam === "A") {
        setTeamAScore((s) => s + 1)
        setIsA1Right((r) => !r)
      } else {
        setTeamBScore((s) => s + 1)
        setIsB1Right((r) => !r)
      }
    } else {
      if (serverNumber === 1) {
        setServerNumber(2)
        if (servingTeam === "A") {
          setActiveServer((s) => (s === "A1" ? "A2" : "A1"))
        } else {
          setActiveServer((s) => (s === "B1" ? "B2" : "B1"))
        }
      } else {
        const newServingTeam: Team = servingTeam === "A" ? "B" : "A"
        setServingTeam(newServingTeam)
        setServerNumber(1)
        if (newServingTeam === "A") {
          setActiveServer(isA1Right ? "A1" : "A2")
        } else {
          setActiveServer(isB1Right ? "B1" : "B2")
        }
      }
    }
  }

  const handleUndo = () => {
    if (history.length === 0) return
    const lastState = history.at(-1)
    if (!lastState) return
    setTeamAScore(lastState.teamAScore)
    setTeamBScore(lastState.teamBScore)
    setServingTeam(lastState.servingTeam)
    setServerNumber(lastState.serverNumber)
    setIsA1Right(lastState.isA1Right)
    setIsB1Right(lastState.isB1Right)
    setActiveServer(lastState.activeServer)
    setHistory((h) => h.slice(0, -1))
  }

  const applyReset = () => {
    setTeamAScore(0)
    setTeamBScore(0)
    setServingTeam("A")
    setServerNumber(2)
    setIsA1Right(true)
    setIsB1Right(true)
    setActiveServer("A1")
    setHistory([])
  }

  const teamBSlots = getTeamBSlots(isB1Right)
  const teamASlots = getTeamASlots(isA1Right)
  const scoreServing = servingTeam === "A" ? teamAScore : teamBScore
  const scoreReceiving = servingTeam === "A" ? teamBScore : teamAScore

  return (
    <div className="flex min-h-screen flex-col gap-6 bg-background p-4 font-sans text-foreground">
      <Card className="rounded-none shadow-none">
        <CardHeader className="text-center">
          <CardTitle className="text-base">Tỷ số</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="flex items-center justify-center gap-4">
            <div
              className={cn(
                "text-5xl font-bold tabular-nums sm:text-6xl",
                servingTeam === "A" && TEAM_COLOR.A.score
              )}
            >
              {teamAScore}
            </div>
            <span className="text-2xl text-muted-foreground" aria-hidden>
              –
            </span>
            <div
              className={cn(
                "text-5xl font-bold tabular-nums sm:text-6xl",
                servingTeam === "B" && TEAM_COLOR.B.score
              )}
            >
              {teamBScore}
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 py-1.5 pr-2 pl-4 text-sm">
            <span className="text-muted-foreground">Lượt giao bóng</span>
            <Badge variant="default">Thứ {serverNumber}</Badge>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              Cách gọi tỷ số:{" "}
            </span>
            {`${scoreServing} - ${scoreReceiving} - ${serverNumber}`}
            <span className="sr-only">
              {` (tỷ số đội giao bóng trước, tỷ số đội nhận, lượt giao thứ ${serverNumber})`}
            </span>
          </p>
        </CardContent>
      </Card>

      <div className="relative flex flex-col justify-between border-2 bg-muted/20">
        <div className="absolute top-0 bottom-0 left-1/2 z-0 -translate-x-1/2">
          <div className="h-full w-2 bg-border" />
        </div>

        <div className="relative z-10 flex w-full flex-col">
          <div className="grid min-h-32 grid-cols-2">
            <div className="flex flex-1 items-center justify-center">
              <CourtSlot
                team="A"
                label={teamASlots.left.label}
                isServing={activeServer === teamASlots.left.id}
              />
            </div>
            <div className="flex flex-1 items-center justify-center">
              <CourtSlot
                team="B"
                label={teamBSlots.right.label}
                isServing={activeServer === teamBSlots.right.id}
              />
            </div>
          </div>

          <div className="h-0.5 w-full bg-border" />

          <div className="grid min-h-32 grid-cols-2">
            <div className="flex flex-1 items-center justify-center">
              <CourtSlot
                team="A"
                label={teamASlots.right.label}
                isServing={activeServer === teamASlots.right.id}
              />
            </div>
            <div className="flex flex-1 items-center justify-center">
              <CourtSlot
                team="B"
                label={teamBSlots.left.label}
                isServing={activeServer === teamBSlots.left.id}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Button
          type="button"
          className={cn(
            "h-auto min-h-16 flex-1 flex-col gap-1 rounded-none py-5 text-base",
            TEAM_COLOR.A.actionButton
          )}
          onClick={() => handleRallyWin("A")}
        >
          Đội A thắng pha
        </Button>

        <Button
          type="button"
          className={cn(
            "h-auto min-h-16 flex-1 flex-col gap-1 rounded-none py-5 text-base",
            TEAM_COLOR.B.actionButton
          )}
          onClick={() => handleRallyWin("B")}
        >
          Đội B thắng pha
        </Button>
      </div>

      <div className="flex flex-col-reverse items-stretch justify-between gap-4 sm:flex-row sm:items-center">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="text-muted-foreground"
            >
              Đặt lại trận đấu
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Bắt đầu lại từ đầu?</AlertDialogTitle>
              <AlertDialogDescription>
                Tỷ số sẽ về 0-0, lượt giao bóng 2, vị trí sân theo mặc định. Các
                bước trước đó sẽ không còn trong lịch sử hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel type="button">Hủy</AlertDialogCancel>
              <AlertDialogAction
                type="button"
                variant="destructive"
                onClick={applyReset}
              >
                Đặt lại
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button
          type="button"
          variant="outline"
          disabled={history.length === 0}
          onClick={handleUndo}
        >
          <Undo2 data-icon="inline-start" />
          Hoàn tác
        </Button>
      </div>
    </div>
  )
}

export default PickleballTracker
