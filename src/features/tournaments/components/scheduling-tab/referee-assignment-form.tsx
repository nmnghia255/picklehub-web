"use client"

import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import { listRefereesAction } from "../../actions/referee-actions"
import { useSchedulingStore } from "../../stores/use-scheduling-store"
import type { Referee } from "../../types/referee"

interface RefereeAssignmentFormProps {
  onSubmit: (refereeId: string) => void
  onClose: () => void
}

export function RefereeAssignmentForm({
  onSubmit,
  onClose,
}: RefereeAssignmentFormProps) {
  const { t } = useTournamentTranslation()
  const tournamentId = useSchedulingStore((s) => s.tournamentId)

  const [refereesList, setRefereesList] = useState<Referee[]>([])
  const [isLoading, setIsLoading] = useState(!!tournamentId)
  const [enterManually, setEnterManually] = useState(false)

  const [refereeName, setRefereeName] = useState("")
  const [refereeId, setRefereeId] = useState("")

  useEffect(() => {
    if (!tournamentId) return
    listRefereesAction(tournamentId.toString())
      .then((res) => {
        if (res.success && res.data) {
          const list = res.data
          setRefereesList(list)
          if (list.length > 0) {
            setRefereeId(list[0].refereeId)
            setRefereeName(list[0].refereeName)
            setEnterManually(false)
          } else {
            setEnterManually(true)
          }
        } else {
          console.error("Failed to fetch referees roster:", res.error)
          setEnterManually(true)
        }
      })
      .catch((err) => {
        console.error("Failed to fetch referees roster:", err)
        setEnterManually(true)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [tournamentId])

  const handleRefereeSelect = (val: string) => {
    const ref = refereesList.find((r) => r.refereeId === val)
    if (ref) {
      setRefereeId(ref.refereeId)
      setRefereeName(ref.refereeName)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!refereeName.trim()) {
      toast.error(
        t("scheduling.toasts.fillRefereeName", {
          defaultValue: "Please enter referee name",
        })
      )
      return
    }
    const finalId = refereeId.trim() || `ref_${Date.now()}`
    onSubmit(finalId)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-sm text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
          <span>
            {t("scheduling.referee.loading", {
              defaultValue: "Loading referees roster...",
            })}
          </span>
        </div>
      ) : (
        <>
          {!enterManually && refereesList.length > 0 ? (
            <div>
              <Label htmlFor="referee-select">
                {t("scheduling.referee.selectLabel", {
                  defaultValue: "Select Enrolled Referee",
                })}
              </Label>
              <Select value={refereeId} onValueChange={handleRefereeSelect}>
                <SelectTrigger
                  id="referee-select"
                  className="mt-1.5 w-full bg-white"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {refereesList.map((ref) => (
                    <SelectItem key={ref.refereeId} value={ref.refereeId}>
                      {ref.refereeName} (
                      {ref.refereeEmail || ref.phone || ref.refereeId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <>
              {refereesList.length === 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                  {t("scheduling.referee.emptyRosterWarning", {
                    defaultValue:
                      "No referees are currently enrolled in this tournament. You can enter information manually below or enroll referees in the Personnel tab first.",
                  })}
                </div>
              )}
              <div>
                <Label htmlFor="ref-name">
                  {t("scheduling.referee.name", {
                    defaultValue: "Referee Name",
                  })}
                </Label>
                <Input
                  id="ref-name"
                  placeholder={t("scheduling.referee.namePlaceholder", {
                    defaultValue: "Enter referee name...",
                  })}
                  value={refereeName}
                  onChange={(e) => setRefereeName(e.target.value)}
                  className="mt-1.5 bg-white"
                />
              </div>
              <div>
                <Label htmlFor="ref-id">
                  {t("scheduling.referee.id", {
                    defaultValue: "Referee ID (Optional)",
                  })}
                </Label>
                <Input
                  id="ref-id"
                  placeholder={t("scheduling.referee.idPlaceholder", {
                    defaultValue: "Referee ID or leave empty...",
                  })}
                  value={refereeId}
                  onChange={(e) => setRefereeId(e.target.value)}
                  className="mt-1.5 bg-white"
                />
              </div>
            </>
          )}

          {refereesList.length > 0 && (
            <div className="flex items-center gap-2 pt-1">
              <Checkbox
                id="enter-manually"
                checked={enterManually}
                onCheckedChange={(checked) => {
                  const manual = !!checked
                  setEnterManually(manual)
                  if (manual) {
                    setRefereeName("")
                    setRefereeId("")
                  } else {
                    const first = refereesList[0]
                    setRefereeId(first?.refereeId || "")
                    setRefereeName(first?.refereeName || "")
                  }
                }}
              />
              <Label
                htmlFor="enter-manually"
                className="cursor-pointer text-xs font-medium text-gray-600"
              >
                {t("scheduling.referee.enterManually", {
                  defaultValue: "Enter referee information manually",
                })}
              </Label>
            </div>
          )}
        </>
      )}

      <div className="flex items-center justify-end gap-3 border-t pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          {t("scheduling.referee.close", { defaultValue: "Close" })}
        </Button>
        <Button
          type="submit"
          className="bg-emerald-600 text-white hover:bg-emerald-700"
          disabled={isLoading}
        >
          {t("scheduling.referee.assignBtn", {
            defaultValue: "Confirm Assignment",
          })}
        </Button>
      </div>
    </form>
  )
}
