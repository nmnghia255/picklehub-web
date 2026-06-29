"use client"

import { format } from "date-fns"
import { Check, UserMinus, UserX } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import {
  approveParticipantAction,
  kickParticipantAction,
} from "../../../actions/social-participant-actions"
import type { SocialParticipant } from "../../../types/social"
import { getParticipantStatusLabel } from "../../../utils"

export default function SocialParticipantsTab({
  participants,
  isEditable,
  socialId,
  status,
}: {
  participants: SocialParticipant[]
  isEditable: boolean
  socialId?: string
  status?: string
}) {
  const { t } = useSocialsTranslation()
  const router = useRouter()
  const [loadingAction, setLoadingAction] = useState<{
    id: string
    action: "approve" | "kick"
  } | null>(null)

  const isCompleted = status === "COMPLETED"

  const handleApprove = async (participantId: string) => {
    if (!socialId || isCompleted) return
    setLoadingAction({ id: participantId, action: "approve" })
    try {
      await approveParticipantAction(socialId, participantId)
      toast.success(
        t("detail.approveSuccess", {
          defaultValue: "Participant approved successfully",
        })
      )
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("detail.approveError")
      )
    } finally {
      setLoadingAction(null)
    }
  }

  const handleKick = async (participantId: string) => {
    if (!socialId || isCompleted) return
    setLoadingAction({ id: participantId, action: "kick" })
    try {
      await kickParticipantAction(socialId, participantId)
      toast.success(
        t("detail.kickSuccess", {
          defaultValue: "Participant removed successfully",
        })
      )
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("detail.kickError")
      )
    } finally {
      setLoadingAction(null)
    }
  }

  return (
    <Card className="sticky top-6 h-fit p-0">
      <CardContent className="space-y-6 p-6">
        <h2 className="text-lg font-semibold">{t("detail.participants")}</h2>
        {!participants || participants.length === 0 ? (
          <Empty className="my-6 border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <UserX className="size-6 text-muted-foreground" />
              </EmptyMedia>
              <EmptyTitle>{t("detail.noParticipants")}</EmptyTitle>
              <EmptyDescription>
                {t("detail.noParticipantsDescription", {
                  defaultValue: "No one has joined this social yet.",
                })}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="mt-4 space-y-3">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center justify-between rounded-2xl border bg-card p-4 transition-all hover:border-border hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarImage
                      src={participant.user.avatarUrl ?? undefined}
                      alt={participant.user.name}
                    />
                    <AvatarFallback>
                      {participant.user.name
                        ? participant.user.name.slice(0, 1)
                        : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-md font-medium">
                      {participant.user.name
                        ? participant.user.name
                        : "Unknown User"}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge
                        className={
                          participant.status === "CONFIRMED"
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                            : participant.status === "WAITLISTED"
                              ? "border-amber-500/30 bg-amber-500/10 text-amber-600"
                              : participant.status === "ON_HOLD"
                                ? "border-blue-500/30 bg-blue-500/10 text-blue-600"
                                : "border-border bg-muted text-muted-foreground"
                        }
                        variant="outline"
                      >
                        {getParticipantStatusLabel(participant.status, t)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-center gap-2">
                  <p
                    className="text-sm text-muted-foreground"
                    suppressHydrationWarning
                  >
                    {t("detail.joinedOn", {
                      date: format(new Date(participant.joinedAt), "MMM d"),
                    })}
                  </p>

                  {isEditable && !participant.isHost && (
                    <div className="flex items-center gap-2">
                      {participant.status === "ON_HOLD" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700"
                          disabled={loadingAction?.id === participant.id}
                          onClick={() => handleApprove(participant.id)}
                        >
                          {loadingAction?.id === participant.id &&
                          loadingAction.action === "approve" ? (
                            t("common.loading")
                          ) : (
                            <>
                              <Check className="mr-1.5 size-3.5" />
                              {t("detail.approve")}
                            </>
                          )}
                        </Button>
                      )}

                      {(participant.status === "CONFIRMED" ||
                        participant.status === "WAITLISTED" ||
                        participant.status === "ON_HOLD") && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          disabled={loadingAction?.id === participant.id}
                          onClick={() => handleKick(participant.id)}
                        >
                          {loadingAction?.id === participant.id &&
                          loadingAction.action === "kick" ? (
                            t("common.loading")
                          ) : (
                            <>
                              <UserMinus className="mr-1.5 size-3.5" />
                              {t("detail.kick")}
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
