"use client"

import { Loader2, UserPlus2 } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { User } from "@/features/profile/types"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import { getUserProfileAction } from "../../actions/tournament-registration-actions"
import { usePersonnelStore } from "../../stores/use-personnel-store"

interface EnrollRefereeDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function EnrollRefereeDialog({
  isOpen,
  onOpenChange,
}: EnrollRefereeDialogProps) {
  const { t } = useTournamentTranslation()
  const enrollReferee = usePersonnelStore((s) => s.enrollReferee)
  const [isPending, startTransition] = useTransition()

  // Local Form State
  const [refereeId, setRefereeId] = useState("")
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const [isFetching, setIsFetching] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  // Set defaults when opening/closing the dialog
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setRefereeId("")
      setUserProfile(null)
      setFetchError(null)
      setIsFetching(false)
    }
    onOpenChange(open)
  }

  const handleVerify = async () => {
    const trimmedId = refereeId.trim()
    if (!trimmedId) return

    setIsFetching(true)
    setFetchError(null)
    setUserProfile(null)

    try {
      const res = await getUserProfileAction(trimmedId)
      if (res.success && res.data) {
        setUserProfile(res.data)
      } else {
        setFetchError(
          res.error ||
            t("personnel.enrollDialog.profileNotFound", {
              defaultValue: "User profile not found. Please verify the ID.",
            })
        )
        toast.error(
          res.error ||
            t("personnel.enrollDialog.profileNotFound", {
              defaultValue: "User profile not found. Please verify the ID.",
            })
        )
      }
    } catch (err) {
      setFetchError(
        t("personnel.enrollDialog.fetchFailed", {
          defaultValue: "Failed to fetch user profile.",
        })
      )
      toast.error(
        t("personnel.enrollDialog.fetchFailed", {
          defaultValue: "Failed to fetch user profile.",
        })
      )
    } finally {
      setIsFetching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userProfile) {
      toast.error(
        t("personnel.enrollDialog.verifyFirst", {
          defaultValue: "Please verify the referee ID first",
        })
      )
      return
    }

    startTransition(async () => {
      const res = await enrollReferee({
        refereeId: userProfile.id,
        refereeName: userProfile.fullName || userProfile.name || "",
        refereeEmail: userProfile.email || "",
        refereeAvatar: userProfile.avatarUrl || "",
        phone: userProfile.phoneNumber || "",
      })
      if (res.success) {
        toast.success(
          t("personnel.enrollDialog.successToast", {
            defaultValue: "Referee enrolled successfully!",
          })
        )
        handleOpenChange(false)
      } else {
        toast.error(
          res.error ||
            t("personnel.enrollDialog.failToast", {
              defaultValue: "Failed to enroll referee",
            })
        )
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="rounded-xl bg-white shadow-xl sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
              <UserPlus2 className="h-5.5 w-5.5 text-emerald-600" />
              {t("personnel.enrollDialog.title")}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              {t("personnel.enrollDialog.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 space-y-4 border-t border-b border-gray-100 py-5">
            {/* Unique ID Input with Verify Button */}
            <div className="space-y-1.5">
              <Label
                htmlFor="enroll-id"
                className="text-sm font-semibold text-gray-700"
              >
                {t("personnel.enrollDialog.idLabel")}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="enroll-id"
                  placeholder={t("personnel.enrollDialog.idPlaceholder")}
                  value={refereeId}
                  onChange={(e) => {
                    setRefereeId(e.target.value)
                    setUserProfile(null)
                    setFetchError(null)
                  }}
                  className="flex-1 bg-white text-sm"
                  required
                  disabled={isFetching || isPending}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleVerify()
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleVerify}
                  disabled={isFetching || isPending || !refereeId.trim()}
                  variant="outline"
                  className="shrink-0 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                >
                  {isFetching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t("personnel.enrollDialog.verifyBtn", {
                      defaultValue: "Verify",
                    })
                  )}
                </Button>
              </div>
            </div>

            {/* Error Message */}
            {fetchError && (
              <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                {fetchError}
              </div>
            )}

            {/* Profile Preview Card */}
            {userProfile && (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-4 transition-all hover:bg-emerald-50/50">
                <div className="flex items-start gap-4">
                  <Avatar className="h-14 w-14 rounded-xl border border-emerald-100 bg-white shadow-xs">
                    <AvatarImage
                      src={userProfile.avatarUrl}
                      alt={userProfile.fullName || userProfile.name}
                    />
                    <AvatarFallback className="rounded-xl bg-emerald-100 text-lg font-bold text-emerald-700">
                      {(userProfile.fullName || userProfile.name || "RF")
                        .substring(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-gray-900">
                        {userProfile.fullName || userProfile.name}
                      </h4>
                      {userProfile.selfRating && (
                        <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/10 ring-inset">
                          ★ {userProfile.selfRating.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 text-xs text-gray-600">
                      <p className="flex items-center gap-1.5">
                        <span className="font-medium text-gray-500">
                          Email:
                        </span>
                        <span
                          className="max-w-[200px] truncate"
                          title={userProfile.email}
                        >
                          {userProfile.email || "N/A"}
                        </span>
                      </p>
                      {userProfile.phoneNumber && (
                        <p className="flex items-center gap-1.5">
                          <span className="font-medium text-gray-500">
                            Phone:
                          </span>
                          <span>{userProfile.phoneNumber}</span>
                        </p>
                      )}
                      {userProfile.preferredHand && (
                        <p className="flex items-center gap-1.5">
                          <span className="font-medium text-gray-500">
                            Hand:
                          </span>
                          <span className="capitalize">
                            {userProfile.preferredHand.toLowerCase()}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-3 border-t border-emerald-100/50 pt-2 text-center text-[11px] font-medium text-emerald-600">
                  ✓{" "}
                  {t("personnel.enrollDialog.verifiedStatus", {
                    defaultValue: "Profile verified and ready to be enrolled",
                  })}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              {t("personnel.roster.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isPending || isFetching || !userProfile}
              className="bg-emerald-600 font-semibold text-white hover:bg-emerald-700"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("personnel.enrollDialog.submitBtn")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
