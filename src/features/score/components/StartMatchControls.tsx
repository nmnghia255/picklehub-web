"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { startMatchAction } from "@/features/tournaments/actions/referee-actions"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import { useScoreStore } from "../stores/use-score-store"

interface StartMatchControlsProps {
  matchId: string | null
}

export function StartMatchControls({ matchId }: StartMatchControlsProps) {
  const { t } = useTournamentTranslation()
  const {
    teamAName,
    teamBName,
    setMatchStatus,
    setServingTeam,
    setServerNumber,
    setActiveServer,
  } = useScoreStore()

  // Coin Toss Wizard State
  const [tossWinner, setTossWinner] = useState<"A" | "B" | null>(null)
  const [tossChoice, setTossChoice] = useState<"serve" | "receive" | null>(null)
  const [isFlipping, setIsFlipping] = useState(false)
  const [flipResultText, setFlipResultText] = useState("")
  const [isStarting, setIsStarting] = useState(false)

  const handleRandomToss = () => {
    setIsFlipping(true)
    setTossWinner(null)
    setTossChoice(null)
    setFlipResultText("Đang xoay đồng xu...")

    setTimeout(() => {
      const winner = Math.random() < 0.5 ? "A" : "B"
      const winnerName = winner === "A" ? teamAName : teamBName
      setTossWinner(winner)
      setFlipResultText(`Kết quả: Đội ${winnerName} thắng tung đồng xu!`)
      setIsFlipping(false)
    }, 1200)
  }

  const handleManualToss = (winner: "A" | "B") => {
    setTossWinner(winner)
    const winnerName = winner === "A" ? teamAName : teamBName
    setFlipResultText(`Đội ${winnerName} thắng tung đồng xu!`)
    setTossChoice(null)
  }

  const handleStartMatch = async () => {
    if (!matchId) return

    let startingTeam: "A" | "B" = "A"
    if (tossWinner && tossChoice) {
      if (tossWinner === "A") {
        startingTeam = tossChoice === "serve" ? "A" : "B"
      } else {
        startingTeam = tossChoice === "serve" ? "B" : "A"
      }
    }

    const currentIds = useScoreStore.getState().playerIds
    const firstServingPlayerId =
      startingTeam === "A" ? currentIds.A1 : currentIds.B1

    setIsStarting(true)
    try {
      const res = await startMatchAction(matchId, {
        firstServingPlayerId: firstServingPlayerId || undefined,
      })

      if (res.success) {
        toast.success("Khởi động trận đấu thành công!")
        setMatchStatus("LIVE")
        setServingTeam(startingTeam)
        const doubles = useScoreStore.getState().isDoubles
        setServerNumber(doubles ? 2 : 1)
        setActiveServer(startingTeam === "A" ? "A1" : "B1")
      } else {
        toast.error(res.error || "Không thể khởi động trận đấu")
      }
    } catch (err) {
      console.error("Failed to start match:", err)
      toast.error("Lỗi kết nối khi khởi động trận đấu")
    } finally {
      setIsStarting(false)
    }
  }

  const startingServingTeam = useMemo(() => {
    if (!tossWinner || !tossChoice) return null
    if (tossWinner === "A") {
      return tossChoice === "serve" ? "A" : "B"
    } else {
      return tossChoice === "serve" ? "B" : "A"
    }
  }, [tossWinner, tossChoice])

  return (
    <div className="animate-fade-in flex flex-col gap-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="text-center">
        <h3 className="text-lg font-black tracking-widest text-emerald-800 uppercase dark:text-emerald-300">
          {t("referee.tracker.matchStartConfig", {
            defaultValue: "Cấu hình bắt đầu trận đấu",
          })}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {t("referee.tracker.matchStartDesc", {
            defaultValue:
              "Chọn đội giao bóng trước để bắt đầu ghi điểm trận đấu.",
          })}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Toss Method */}
        <div className="flex flex-col justify-between gap-4 rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/20">
          <div>
            <h4 className="text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-zinc-300">
              🪙{" "}
              {t("referee.tracker.tossFlow", {
                defaultValue: "Luồng tung đồng xu",
              })}
            </h4>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {t("referee.tracker.tossFlowDesc", {
                defaultValue:
                  "Mô phỏng tung đồng xu ngẫu nhiên hoặc chọn đội thắng tung đồng xu thực tế.",
              })}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              type="button"
              onClick={handleRandomToss}
              disabled={isFlipping}
              className="h-9 w-full bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700"
            >
              {isFlipping ? "🪙 Đang tung..." : "🪙 Tung đồng xu ngẫu nhiên"}
            </Button>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleManualToss("A")}
                className="h-9 flex-1 text-xs font-semibold"
              >
                🏆 Đội A thắng
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleManualToss("B")}
                className="h-9 flex-1 text-xs font-semibold"
              >
                🏆 Đội B thắng
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Select Method */}
        <div className="flex flex-col justify-between gap-4 rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/20">
          <div>
            <h4 className="text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-zinc-300">
              ⚡{" "}
              {t("referee.tracker.quickSelect", { defaultValue: "Chọn nhanh" })}
            </h4>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {t("referee.tracker.quickSelectDesc", {
                defaultValue:
                  "Chỉ định trực tiếp đội giao bóng đầu tiên của trận đấu.",
              })}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setTossWinner("A")
                setTossChoice("serve")
                setFlipResultText("Chỉ định Đội A giao bóng trước.")
              }}
              className="h-9 flex-1 border border-blue-200 bg-blue-50 text-xs font-bold text-blue-800 hover:bg-blue-100 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-300"
            >
              🎾 Đội A giao trước
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setTossWinner("B")
                setTossChoice("serve")
                setFlipResultText("Chỉ định Đội B giao bóng trước.")
              }}
              className="h-9 flex-1 border border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300"
            >
              🎾 Đội B giao trước
            </Button>
          </div>
        </div>
      </div>

      {/* Toss Result and Choice details */}
      {flipResultText && (
        <div className="animate-fade-in animate-duration-300 rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-center dark:border-amber-900/50 dark:bg-amber-950/10">
          <span className="mb-2 block text-xs font-bold text-amber-800 dark:text-amber-300">
            {flipResultText}
          </span>

          {tossWinner && !tossChoice && (
            <div className="mt-2 flex justify-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setTossChoice("serve")}
                className="bg-white text-xs font-bold"
              >
                🎾 Giao bóng trước (Serve)
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setTossChoice("receive")}
                className="bg-white text-xs font-bold"
              >
                🛡️ Nhận bóng trước (Receive)
              </Button>
            </div>
          )}

          {startingServingTeam && (
            <div className="mt-2 text-xs font-bold text-gray-800 dark:text-zinc-200">
              👉 Đội giao bóng đầu tiên:{" "}
              <span className="animate-pulse font-extrabold text-emerald-600 uppercase dark:text-emerald-400">
                {startingServingTeam === "A" ? teamAName : teamBName}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Start Match Trigger */}
      <div className="mt-2 border-t pt-4">
        <Button
          type="button"
          disabled={isStarting || !startingServingTeam}
          onClick={handleStartMatch}
          className="h-12 w-full rounded-xl bg-emerald-600 text-sm font-extrabold text-white shadow-md transition-all hover:bg-emerald-700 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50"
        >
          {isStarting
            ? "ĐANG BẮT ĐẦU TRẬN ĐẤU..."
            : "🚀 XÁC NHẬN & BẮT ĐẦU TRẬN ĐẤU"}
        </Button>
      </div>
    </div>
  )
}
