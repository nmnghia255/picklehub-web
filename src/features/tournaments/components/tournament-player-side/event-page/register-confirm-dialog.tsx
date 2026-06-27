"use client"

import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { FriendUser } from "@/features/friend/types"
import type { User } from "@/features/profile/types"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import {
  getFriendsAction,
  getUserProfileAction,
} from "../../../actions/tournament-registration-actions"
import type { TournamentEvent } from "../../../types/tournament-event"

interface RegisterConfirmDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  currentUser: User
  event: TournamentEvent
  onConfirm: (partner?: User) => void
  isRegistering: boolean
}

export function RegisterConfirmDialog({
  isOpen,
  onOpenChange,
  currentUser,
  event,
  onConfirm,
  isRegistering,
}: RegisterConfirmDialogProps) {
  const { t } = useTournamentTranslation()
  const isDoubles = event.type === "Doubles"

  const [friends, setFriends] = useState<FriendUser[]>([])
  const [selectedFriendId, setSelectedFriendId] = useState<string>("")
  const [partnerProfile, setPartnerProfile] = useState<User | null>(null)

  const [isLoadingFriends, setIsLoadingFriends] = useState(false)
  const [isLoadingPartner, setIsLoadingPartner] = useState(false)

  // Reset state and fetch friends on dialog open
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedFriendId("")

      setPartnerProfile(null)

      if (isDoubles) {
        setIsLoadingFriends(true)
        getFriendsAction().then((res) => {
          if (res.success && res.data) {
            setFriends(res.data)
          } else {
            toast.error(res.error || "Failed to load friends list")
          }
          setIsLoadingFriends(false)
        })
      }
    }
  }, [isOpen, isDoubles])

  const handleFriendSelect = (friendId: string) => {
    setSelectedFriendId(friendId)
    if (friendId) {
      setIsLoadingPartner(true)
      getUserProfileAction(friendId).then((res) => {
        if (res.success && res.data) {
          setPartnerProfile(res.data)
        } else {
          toast.error(res.error || "Failed to load partner details")
          setPartnerProfile(null)
        }
        setIsLoadingPartner(false)
      })
    } else {
      setPartnerProfile(null)
    }
  }

  const getRatingValue = (user: User) => {
    let ratingVal = user.selfRating || 3.0
    if (user.dupr) {
      if (event.type === "Singles") {
        ratingVal = user.dupr.singlesRating || user.dupr.rating || ratingVal
      } else {
        ratingVal = user.dupr.doublesRating || user.dupr.rating || ratingVal
      }
    }
    return ratingVal
  }

  const getGenderLabel = (gender?: string) => {
    if (!gender) return ""
    const g = gender.toUpperCase()
    if (g === "MALE") {
      return t("teamMatching.genderMale", { defaultValue: "Male" })
    }
    if (g === "FEMALE") {
      return t("teamMatching.genderFemale", { defaultValue: "Female" })
    }
    return gender
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (isDoubles && !partnerProfile) {
      toast.error(
        t("eventDetail.selectPartnerError", {
          defaultValue: "Please select a partner",
        })
      )
      return
    }

    onConfirm(partnerProfile || undefined)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-black">
            {t("eventDetail.confirmRegistrationTitle", {
              defaultValue: "Confirm Registration Details",
            })}
          </DialogTitle>
          <DialogDescription>
            {t("eventDetail.confirmRegistrationDesc", {
              defaultValue:
                "Please review your registration details before proceeding.",
            })}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Main Grid for Players Info */}
          <div className="space-y-4">
            {/* Player 1 Details */}
            <div className="space-y-2">
              <label className="text-sm font-bold tracking-wider text-gray-700 uppercase">
                {t("eventDetail.player1", { defaultValue: "Player 1 (You)" })}
              </label>
              <div className="mt-2 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                <Avatar className="h-10 w-10 border border-emerald-200">
                  <AvatarImage
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName}
                  />
                  <AvatarFallback className="bg-emerald-100 font-bold text-emerald-800">
                    {currentUser.fullName
                      ? currentUser.fullName.substring(0, 2).toUpperCase()
                      : "ME"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h4 className="text-md truncate font-semibold text-gray-900">
                    {currentUser.fullName}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {t("eventDetail.genderCategory", {
                      defaultValue: "Gender",
                    })}
                    : {getGenderLabel(currentUser.gender)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center rounded-md bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">
                    DUPR {getRatingValue(currentUser).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Player 2 Selection & Details (Doubles only) */}
            {isDoubles && (
              <div className="space-y-4 border-t border-gray-100 pt-2">
                <label className="text-sm font-bold tracking-wider text-gray-700 uppercase">
                  {t("eventDetail.player2", {
                    defaultValue: "Player 2 (Partner)",
                  })}
                </label>

                {isLoadingFriends ? (
                  <div className="mt-2 flex items-center justify-center py-4 text-sm text-gray-400">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-emerald-600" />
                    {t("eventDetail.loadingFriends", {
                      defaultValue: "Loading friends list...",
                    })}
                  </div>
                ) : friends.length === 0 ? (
                  <div className="mt-2 rounded-xl border border-dashed border-gray-200 p-4 text-center text-sm text-gray-400">
                    {t("eventDetail.noFriendsFound", {
                      defaultValue:
                        "No friends found. Please add friends to register for doubles events.",
                    })}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Select
                      value={selectedFriendId}
                      onValueChange={handleFriendSelect}
                    >
                      <SelectTrigger className="w-full border-gray-200 bg-white focus:border-emerald-500 focus:ring-emerald-500">
                        <SelectValue
                          placeholder={t(
                            "eventDetail.selectPartnerPlaceholder",
                            { defaultValue: "Select your partner" }
                          )}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {friends.map((friend) => (
                          <SelectItem key={friend.id} value={friend.id}>
                            {friend.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {isLoadingPartner ? (
                      <div className="flex items-center justify-center rounded-xl border bg-gray-50/50 p-6">
                        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                      </div>
                    ) : partnerProfile ? (
                      <div className="animate-fadeIn flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/20 p-3 shadow-xs transition-all">
                        <Avatar className="h-10 w-10 border border-blue-200">
                          <AvatarImage
                            src={partnerProfile.avatarUrl}
                            alt={partnerProfile.fullName}
                          />
                          <AvatarFallback className="bg-blue-100 font-bold text-blue-800">
                            {partnerProfile.fullName
                              ? partnerProfile.fullName
                                  .substring(0, 2)
                                  .toUpperCase()
                              : "P2"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate text-sm font-semibold text-gray-900">
                            {partnerProfile.fullName}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {t("eventDetail.genderCategory", {
                              defaultValue: "Gender",
                            })}
                            : {getGenderLabel(partnerProfile.gender)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center rounded-md bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                            DUPR {getRatingValue(partnerProfile).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-amber-600 italic">
                        *{" "}
                        {t("eventDetail.partnerRequiredNotice", {
                          defaultValue:
                            "Please select a partner to complete registration.",
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={isRegistering}
              onClick={() => onOpenChange(false)}
            >
              {t("eventDetail.cancel", { defaultValue: "Cancel" })}
            </Button>
            <Button
              type="submit"
              disabled={isRegistering || (isDoubles && !partnerProfile)}
              className="bg-emerald-600 font-bold text-white hover:bg-emerald-700"
            >
              {isRegistering ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("eventDetail.registering", {
                    defaultValue: "Registering...",
                  })}
                </>
              ) : (
                t("eventDetail.confirmAndRegister", {
                  defaultValue: "Confirm & Register",
                })
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
