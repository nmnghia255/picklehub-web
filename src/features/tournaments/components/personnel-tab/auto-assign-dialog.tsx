"use client"

import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  Shield,
  Sparkles,
  Users,
} from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import { usePersonnelStore } from "../../stores/use-personnel-store"
import type { AssignedReferee, Referee } from "../../types/referee"
import type { TournamentSchedule } from "../../types/schedule"
import { autoScheduleReferees } from "../../utils/referee-scheduler"

interface AutoAssignRefereesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  referees: Referee[]
  allMatches: AssignedReferee[]
  scheduleMap: Record<string, TournamentSchedule>
  isEditable: boolean
}

export function AutoAssignRefereesDialog({
  open,
  onOpenChange,
  referees,
  allMatches,
  scheduleMap,
  isEditable,
}: AutoAssignRefereesDialogProps) {
  const { t } = useTournamentTranslation()
  const [isApplying, setIsApplying] = useState(false)

  const bulkAssignRefereeAction = usePersonnelStore((s) => s.bulkAssignReferee)
  const fetchMatches = usePersonnelStore((s) => s.fetchMatches)
  const fetchRoster = usePersonnelStore((s) => s.fetchRoster)

  // Compute auto-schedule results whenever dialog is open
  const result = useMemo(() => {
    if (!open) return null
    const schedResult = autoScheduleReferees(referees, allMatches, scheduleMap)

    const assignmentsByReferee: Record<string, string[]> = {}
    for (const item of schedResult.assignments) {
      if (!assignmentsByReferee[item.refereeId]) {
        assignmentsByReferee[item.refereeId] = []
      }
      assignmentsByReferee[item.refereeId].push(item.matchId)
    }

    return {
      ...schedResult,
      assignmentsByReferee,
    }
  }, [open, referees, allMatches, scheduleMap])

  if (!result) return null

  const {
    assignments,
    assignmentsByReferee,
    unassignableMatches,
    minRefereesRequired,
    peakConcurrentMatches,
    peakSlot,
    refereeWorkloads,
    isFullyScheduled,
    hasInsufficientReferees,
  } = result

  const handleConfirmApply = async () => {
    if (assignments.length === 0 || !isEditable) return

    setIsApplying(true)
    try {
      let successCount = 0
      let failCount = 0

      // Execute bulk assign for each referee
      for (const [refereeId, matchIds] of Object.entries(
        assignmentsByReferee
      )) {
        if (matchIds.length === 0) continue
        const res = await bulkAssignRefereeAction(matchIds, refereeId)
        if (res.success) {
          successCount += matchIds.length
        } else {
          failCount += matchIds.length
        }
      }

      await fetchMatches()
      await fetchRoster()

      if (failCount === 0) {
        toast.success(
          t("personnel.autoAssign.successToast", {
            count: successCount,
            defaultValue: `Đã phân công tự động thành công ${successCount} trận đấu cho các trọng tài!`,
          })
        )
      } else {
        toast.warning(
          t("personnel.autoAssign.partialToast", {
            success: successCount,
            fail: failCount,
            defaultValue: `Đã phân công ${successCount} trận đấu. Có ${failCount} trận gặp lỗi.`,
          })
        )
      }
      onOpenChange(false)
    } catch (err) {
      console.error("Auto assign error:", err)
      toast.error(
        t("personnel.autoAssign.errorToast", {
          defaultValue:
            "Đã xảy ra lỗi ngoài dự kiến khi áp dụng xếp lịch tự động.",
        })
      )
    } finally {
      setIsApplying(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-gray-900">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            {t("personnel.autoAssign.title", {
              defaultValue: "Tự động xếp lịch trọng tài",
            })}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            {t("personnel.autoAssign.description", {
              defaultValue:
                "Phân công vòng tròn cân bằng khối lượng công việc và đảm bảo không có trọng tài nào bắt 2 trận cùng thời điểm.",
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Warning Banner if insufficient referees */}
          {hasInsufficientReferees || !isFullyScheduled ? (
            <Alert
              variant="destructive"
              className="border-amber-200 bg-amber-50 text-amber-900"
            >
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <AlertTitle className="text-base font-bold text-amber-900">
                {t("personnel.autoAssign.warningTitle", {
                  defaultValue:
                    "Không đủ trọng tài để quản lý tất cả trận đấu!",
                })}
              </AlertTitle>
              <AlertDescription className="mt-2 space-y-2 text-sm text-amber-800">
                <div className="flex flex-wrap items-center gap-2">
                  <span>
                    {t("personnel.autoAssign.availableReferees", {
                      defaultValue: "Số trọng tài hiện có:",
                    })}
                  </span>
                  <Badge
                    variant="outline"
                    className="border-amber-300 bg-amber-100 font-bold text-amber-900"
                  >
                    {t("personnel.autoAssign.refereesUnit", {
                      count: referees.length,
                      defaultValue: `${referees.length} trọng tài`,
                    })}
                  </Badge>
                  <span className="font-bold text-red-700">
                    {t("personnel.autoAssign.minRequired", {
                      defaultValue: "➔ Cần tối thiểu:",
                    })}
                  </span>
                  <Badge
                    variant="destructive"
                    className="bg-red-600 font-extrabold text-white"
                  >
                    {t("personnel.autoAssign.refereesUnit", {
                      count: minRefereesRequired,
                      defaultValue: `${minRefereesRequired} trọng tài`,
                    })}
                  </Badge>
                </div>

                <div className="rounded-md bg-amber-100/70 p-2.5 text-xs text-amber-900">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <Clock className="h-4 w-4 text-amber-700" />
                    {t("personnel.autoAssign.peakSlotHeader", {
                      slot: peakSlot,
                      defaultValue: `Khung giờ cao điểm: ${peakSlot}`,
                    })}
                  </div>
                  <p className="mt-1">
                    {t("personnel.autoAssign.peakSlotDesc", {
                      count: peakConcurrentMatches,
                      available: referees.length,
                      defaultValue: `Có ${peakConcurrentMatches} trận đấu diễn ra đồng thời trong khung giờ này, nhưng chỉ có ${referees.length} trọng tài.`,
                    })}
                  </p>
                </div>

                {unassignableMatches.length > 0 && (
                  <p className="text-xs text-amber-900">
                    {t("personnel.autoAssign.unassignableNote", {
                      count: unassignableMatches.length,
                      assigned: assignments.length,
                      defaultValue: `Có ${unassignableMatches.length} trận đấu chưa thể phân công do trùng lịch trọng tài. Bạn có thể thêm trọng tài vào danh sách tuyển chọn hoặc áp dụng phân công cho ${assignments.length} trận đấu đã xếp được.`,
                    })}
                  </p>
                )}
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <AlertTitle className="text-base font-bold text-emerald-900">
                {t("personnel.autoAssign.successTitle", {
                  defaultValue: "Đã tính toán phân công tối ưu thành công!",
                })}
              </AlertTitle>
              <AlertDescription className="mt-1 text-sm text-emerald-800">
                {t("personnel.autoAssign.successDesc", {
                  assignedCount: assignments.length,
                  refereeCount: referees.length,
                  defaultValue: `Tất cả ${assignments.length} trận đấu đã được phân bổ đều cho ${referees.length} trọng tài mà không có bất kỳ xung đột thời gian nào.`,
                })}
              </AlertDescription>
            </Alert>
          )}

          {/* Referee Workload Breakdown */}
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-800">
              <Users className="h-4 w-4 text-gray-500" />
              {t("personnel.autoAssign.workloadTableTitle", {
                defaultValue: "Bảng cân bằng số trận đấu của trọng tài",
              })}
            </h4>

            <div className="overflow-hidden rounded-md border border-gray-200">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="w-[40%] text-xs font-semibold text-gray-600">
                      {t("personnel.autoAssign.table.referee", {
                        defaultValue: "Trọng tài",
                      })}
                    </TableHead>
                    <TableHead className="text-center text-xs font-semibold text-gray-600">
                      {t("personnel.autoAssign.table.initial", {
                        defaultValue: "Đã xếp trước",
                      })}
                    </TableHead>
                    <TableHead className="text-center text-xs font-semibold text-gray-600">
                      {t("personnel.autoAssign.table.new", {
                        defaultValue: "Thêm mới",
                      })}
                    </TableHead>
                    <TableHead className="text-center text-xs font-semibold text-gray-600">
                      {t("personnel.autoAssign.table.total", {
                        defaultValue: "Tổng trận",
                      })}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {refereeWorkloads.map((ref) => (
                    <TableRow key={ref.refereeId}>
                      <TableCell className="text-xs font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          <Shield className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                          <span>{ref.refereeName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-xs text-gray-600">
                        {ref.initialCount}
                      </TableCell>
                      <TableCell className="text-center text-xs font-semibold text-emerald-600">
                        +{ref.newCount}
                      </TableCell>
                      <TableCell className="text-center text-xs font-bold text-gray-900">
                        <Badge
                          variant="secondary"
                          className="border-emerald-200 bg-emerald-50 text-emerald-800"
                        >
                          {t("personnel.roster.matchesCount", {
                            count: ref.totalCount,
                            defaultValue: `${ref.totalCount} trận`,
                          })}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {refereeWorkloads.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="py-4 text-center text-xs text-gray-500"
                      >
                        {t("personnel.autoAssign.emptyRoster", {
                          defaultValue:
                            "Chưa có trọng tài nào trong danh sách.",
                        })}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isApplying}
          >
            {t("personnel.autoAssign.cancelBtn", {
              defaultValue: "Hủy",
            })}
          </Button>

          <Button
            type="button"
            className="bg-emerald-600 font-semibold text-white hover:bg-emerald-700"
            disabled={assignments.length === 0 || isApplying || !isEditable}
            onClick={() => void handleConfirmApply()}
          >
            {isApplying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("personnel.autoAssign.applying", {
                  defaultValue: "Đang áp dụng...",
                })}
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-1 h-4 w-4" />
                {t("personnel.autoAssign.confirmBtn", {
                  count: assignments.length,
                  defaultValue: `Xác nhận phân công (${assignments.length} trận)`,
                })}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
