import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Match } from "@/features/matches/types"
import { cn } from "@/lib/utils"

interface MatchHistoryProps {
  matches: Match[]
  currentUserId: string
}

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "-"
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
  }).format(date)
}

function formatScore(match: Match): string {
  if (Array.isArray(match.sets) && match.sets.length > 0) {
    return match.sets.map((set) => `${set[0]}-${set[1]}`).join(", ")
  }

  return `${match.scoreA}-${match.scoreB}`
}

function getMemberId(member: unknown): string {
  if (!member) return ""
  if (typeof member === "string") return member
  if (typeof member === "object" && member !== null) {
    const obj = member as Record<string, unknown>
    const id = obj.id || obj.userId
    if (typeof id === "string") return id
  }
  return ""
}

function getMemberName(member: unknown): string {
  if (!member) return ""
  if (typeof member === "string") {
    return member.length === 36 ? `User ${member.slice(0, 8)}` : member
  }
  if (typeof member === "object" && member !== null) {
    const obj = member as Record<string, unknown>
    const name = obj.fullName || obj.name
    if (typeof name === "string") return name
    const id = obj.id || obj.userId
    if (typeof id === "string") {
      return `User ${id.slice(0, 8)}`
    }
  }
  return ""
}

function getOpponentLabel(match: Match, currentUserId: string): string {
  const teamAIds = match.teamA.map(getMemberId)
  const isInTeamA = teamAIds.includes(currentUserId)
  const opponentTeam = isInTeamA ? match.teamB : match.teamA

  if (!Array.isArray(opponentTeam) || opponentTeam.length === 0) {
    return "Không xác định"
  }

  if (opponentTeam.length === 1) {
    return getMemberName(opponentTeam[0]) || "Không xác định"
  }

  return `Team (${opponentTeam.length} người)`
}

function getResult(match: Match, currentUserId: string): string {
  if (match.winner === "DRAW") {
    return "Hòa"
  }

  if (!match.winner) {
    if (match.status === "CANCELLED") {
      return "Đã hủy"
    }

    return "Chưa xác nhận"
  }

  const teamAIds = match.teamA.map(getMemberId)
  const isInTeamA = teamAIds.includes(currentUserId)
  const won =
    (isInTeamA && match.winner === "TEAM_A") ||
    (!isInTeamA && match.winner === "TEAM_B")

  return won ? "Thắng" : "Thua"
}

function getResultClassName(result: string): string {
  if (result === "Thắng") {
    return "bg-green-500 text-white"
  }

  if (result === "Thua") {
    return "bg-gray-400 text-white"
  }

  return "bg-secondary text-secondary-foreground"
}

export function MatchHistory({ matches, currentUserId }: MatchHistoryProps) {
  return (
    <div className="rounded-2xl border bg-card p-6 text-card-foreground shadow">
      <h3 className="mb-4 font-semibold">Trận đấu gần đây</h3>
      <Table className="text-left">
        <TableHeader>
          <TableRow className="text-sm text-muted-foreground hover:bg-transparent">
            <TableHead>Ngày</TableHead>
            <TableHead>Đối thủ</TableHead>
            <TableHead>Kết quả</TableHead>
            <TableHead>Điểm</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {matches.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center text-muted-foreground"
              >
                Chưa có dữ liệu trận đấu
              </TableCell>
            </TableRow>
          ) : (
            matches.map((match) => {
              const result = getResult(match, currentUserId)
              return (
                <TableRow key={match.id}>
                  <TableCell>{formatDate(match.scheduledAt)}</TableCell>
                  <TableCell>
                    {getOpponentLabel(match, currentUserId)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "rounded px-2 py-1 text-xs font-medium",
                        getResultClassName(result)
                      )}
                    >
                      {result}
                    </span>
                  </TableCell>
                  <TableCell>{formatScore(match)}</TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
