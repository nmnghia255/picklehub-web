"use client"

import { useRouter } from "next/navigation"
import { startTransition, useActionState, useEffect, useState } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect } from "@/components/ui/native-select"

import {
  approvePlaySessionGuestAction,
  type PlaySessionGuestActionState,
  requestPlaySessionGuestAction,
  reservePlaySessionGuestAction,
} from "../actions/play-session-guests"
import type { PlaySessionGuest, PlaySessionParticipant } from "../types"
import { PlaySessionParticipantDetail } from "./play-session-participants-detail"

interface PlaySessionParticipantsProps {
  maxSlots: number | null
  playSessionId: string
  groupId?: string
  participants: PlaySessionParticipant[]
  guests: PlaySessionGuest[]
  isHost?: boolean
  error?: string | null
  guestsError?: string | null
}

const OFFICIAL_PARTICIPANT_STATUSES = new Set(["CONFIRMED"])
const WAITLIST_PARTICIPANT_STATUSES = new Set(["WAITLISTED"])

const initialGuestActionState: PlaySessionGuestActionState = {}

function normalizeParticipantStatus(status?: string): string {
  return String(status ?? "")
    .trim()
    .toUpperCase()
}

function getParticipantBucketStatus(
  status?: string
): "CONFIRMED" | "WAITLISTED" | "ON_HOLD" | "CANCELLED" | "UNKNOWN" {
  const normalized = normalizeParticipantStatus(status)

  if (OFFICIAL_PARTICIPANT_STATUSES.has(normalized)) {
    return "CONFIRMED"
  }

  if (WAITLIST_PARTICIPANT_STATUSES.has(normalized)) {
    return "WAITLISTED"
  }

  if (normalized === "ON_HOLD") {
    return "ON_HOLD"
  }

  if (normalized === "CANCELLED") {
    return "CANCELLED"
  }

  return "UNKNOWN"
}

function getGuestBucketStatus(
  status?: string
): "REQUESTED" | "CONFIRMED" | "WAITLISTED" | "ON_HOLD" | "UNKNOWN" {
  const normalized = normalizeParticipantStatus(status)

  if (normalized === "CONFIRMED") {
    return "CONFIRMED"
  }

  if (normalized === "WAITLISTED") {
    return "WAITLISTED"
  }

  if (normalized === "ON_HOLD") {
    return "ON_HOLD"
  }

  if (normalized === "REQUESTED") {
    return "REQUESTED"
  }

  return "UNKNOWN"
}

function toDisplayGuestType(type?: string): string {
  return normalizeParticipantStatus(type) === "RESERVED"
    ? "Reserved"
    : "Drop-in"
}

function toSlotCountValue(maxSlots: number | null): number | null {
  if (typeof maxSlots !== "number" || !Number.isFinite(maxSlots)) {
    return null
  }

  return Math.max(0, Math.floor(maxSlots))
}

function getAvatarFallback(name?: string | null) {
  const displayName = String(name ?? "").trim()
  if (!displayName) {
    return "N"
  }

  return (
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "N"
  )
}

// Participant Cells
function ParticipantGridItem({
  participant,
  isActive,
  onSelect,
}: {
  participant: PlaySessionParticipant
  isActive: boolean
  onSelect: (participant: PlaySessionParticipant) => void
}) {
  const displayName = participant.name || "Người chơi"
  const fallback = getAvatarFallback(displayName)

  return (
    <button
      type="button"
      onClick={() => onSelect(participant)}
      className={`flex h-24 w-24 cursor-pointer flex-col items-center gap-3 rounded-full bg-transparent p-3 text-left transition-colors ${isActive ? "border-primary bg-accent" : "bg-card"}`}
    >
      <Avatar className="h-16 w-16 rounded-full object-cover">
        <AvatarImage
          src={participant.avatarUrl ?? undefined}
          alt={displayName}
        />
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">
          {displayName}
        </p>
      </div>
    </button>
  )
}

// List Participant
function ParticipantsGrid({
  participants,
  emptySlotsCount = 0,
  selectedParticipantId,
  onSelect,
  onEmptySlotClick,
}: {
  participants: PlaySessionParticipant[]
  emptySlotsCount?: number
  selectedParticipantId?: string
  onSelect: (participant: PlaySessionParticipant) => void
  onEmptySlotClick?: () => void
}) {
  const safeEmptySlotsCount = Math.max(0, Math.floor(emptySlotsCount))

  return (
    <>
      {/* Các thành viên chính thức */}
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-8">
        {participants.map((participant) => (
          <ParticipantGridItem
            key={`${participant.userId}-${participant.joinedAt ?? participant.id}`}
            participant={participant}
            isActive={participant.id === selectedParticipantId}
            onSelect={onSelect}
          />
        ))}
        {/* Các ô trống */}
        {Array.from({ length: safeEmptySlotsCount }).map((_, index) => (
          <Button
            key={`empty-slot-${index}`}
            onClick={onEmptySlotClick}
            className="flex h-24 w-24 cursor-pointer flex-col items-center gap-3 rounded-full bg-transparent p-3 hover:bg-transparent"
          >
            <div className="h-16 w-16 rounded-full border-2 border-dashed border-gray-600 bg-gray-900" />
            <span className="absolute text-4xl text-gray-400">+</span>
          </Button>
        ))}
      </div>
    </>
  )
}

// function GuestApprovalRow({
//   playSessionId,
//   groupId,
//   guest,
//   showConfirmButton,
// }: {
//   playSessionId: string
//   groupId?: string
//   guest: PlaySessionGuest
//   showConfirmButton: boolean
// }) {
//   const router = useRouter()
//   const [state, approveAction, isPending] = useActionState(
//     approvePlaySessionGuestAction.bind(
//       null,
//       groupId ?? null,
//       playSessionId,
//       guest.id
//     ),
//     initialGuestActionState
//   )

//   useEffect(() => {
//     if (!state.success) {
//       return
//     }

//     router.refresh()
//   }, [router, state.success])

//   const submitStatus = (
//     event: React.FormEvent<HTMLFormElement>,
//     status: "CONFIRMED" | "WAITLISTED" | "ON_HOLD"
//   ) => {
//     event.preventDefault()
//     const formData = new FormData()
//     formData.set("status", status)
//     startTransition(() => approveAction(formData))
//   }

//   return (
//     <div className="rounded-md border p-3">
//       <div className="flex flex-wrap items-center justify-between gap-3">
//         <div className="min-w-0">
//           <p className="truncate text-sm font-medium text-foreground">{guest.name}</p>
//           <p className="text-xs text-muted-foreground">
//             {toDisplayGuestType(guest.type)}
//             {typeof guest.skillLevel === "number" ? ` • Level ${guest.skillLevel}` : ""}
//           </p>
//         </div>
//         <Badge variant="outline">REQUESTED</Badge>
//       </div>
//       <div className="mt-3 flex flex-wrap gap-2">
//         <form
//           onSubmit={(event) =>
//             submitStatus(event, showConfirmButton ? "CONFIRMED" : "WAITLISTED")
//           }
//         >
//           <Button type="submit" size="sm" disabled={isPending}>
//             {showConfirmButton ? "Put In Confirmed" : "Put In Waitlist"}
//           </Button>
//         </form>

//         <form onSubmit={(event) => submitStatus(event, "ON_HOLD")}>
//           <Button type="submit" size="sm" variant="outline" disabled={isPending}>
//             Put On Hold
//           </Button>
//         </form>
//       </div>
//       {state.error && (
//         <p className="mt-2 text-xs text-destructive">{state.error}</p>
//       )}
//     </div>
//   )
// }

function GuestRequestDialog({
  playSessionId,
  groupId,
  isHost,
  open,
  onOpenChange,
}: {
  playSessionId: string
  groupId?: string
  isHost: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const [mode, setMode] = useState<"request" | "reserve">("request")
  const [requestState, requestAction, isRequestPending] = useActionState(
    requestPlaySessionGuestAction.bind(null, groupId ?? null, playSessionId),
    initialGuestActionState
  )
  const [reserveState, reserveAction, isReservePending] = useActionState(
    reservePlaySessionGuestAction.bind(null, groupId ?? null, playSessionId),
    initialGuestActionState
  )

  const activeState = mode === "reserve" ? reserveState : requestState
  const isPending = mode === "reserve" ? isReservePending : isRequestPending

  // Effect to close dialog and refresh on success
  useEffect(() => {
    if (!requestState.success && !reserveState.success) {
      return
    }
    onOpenChange(false)
    router.refresh()
  }, [requestState.success, reserveState.success, onOpenChange, router])

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isPending) return

    const formData = new FormData(event.currentTarget)
    startTransition(() => {
      if (mode === "reserve") {
        reserveAction(formData)
      } else {
        requestAction(formData)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="[&>button]:hidden">
        <form onSubmit={onSubmit}>
          {/* ... rest of the form */}
          <DialogFooter showCloseButton>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Dang xu ly..."
                : mode === "reserve"
                  ? "Reserve guest"
                  : "Send request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Type for the fetch response – we'll treat it as unknown and cast later
type UnknownArray = readonly unknown[]

export function PlaySessionParticipants({
  maxSlots,
  playSessionId,
  groupId,
  participants,
  guests,
  isHost = false,
  error,
  guestsError,
}: PlaySessionParticipantsProps) {
  const [selectedParticipant, setSelectedParticipant] =
    useState<PlaySessionParticipant | null>(null)

  const [fetchedByStatus, setFetchedByStatus] = useState<
    Record<string, UnknownArray | null>
  >({
    CONFIRMED: null,
    WAITLISTED: null,
    ON_HOLD: null,
    REQUESTED: null,
  })
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [isFetching, setIsFetching] = useState(false)

  const [openGuestDialog, setOpenGuestDialog] = useState(false)

  // Use fetched data when available, otherwise fall back to provided props.
  const officialParticipants: PlaySessionParticipant[] =
    (fetchedByStatus.CONFIRMED as PlaySessionParticipant[] | null) ??
    participants.filter(
      (participant) =>
        getParticipantBucketStatus(participant.status) === "CONFIRMED"
    )

  const waitlistParticipants: PlaySessionParticipant[] =
    (fetchedByStatus.WAITLISTED as PlaySessionParticipant[] | null) ??
    participants.filter(
      (participant) =>
        getParticipantBucketStatus(participant.status) === "WAITLISTED"
    )

  const onHoldParticipants: PlaySessionParticipant[] =
    (fetchedByStatus.ON_HOLD as PlaySessionParticipant[] | null) ??
    participants.filter(
      (participant) =>
        getParticipantBucketStatus(participant.status) === "ON_HOLD"
    )

  const requestedGuests: PlaySessionGuest[] =
    (fetchedByStatus.REQUESTED as PlaySessionGuest[] | null) ??
    guests.filter((guest) => getGuestBucketStatus(guest.status) === "REQUESTED")

  const confirmedGuests = guests.filter(
    (guest) => getGuestBucketStatus(guest.status) === "CONFIRMED"
  )
  const waitlistedGuests = guests.filter(
    (guest) => getGuestBucketStatus(guest.status) === "WAITLISTED"
  )
  const onHoldGuests = guests.filter(
    (guest) => getGuestBucketStatus(guest.status) === "ON_HOLD"
  )

  // Fetch participants by status with proper cleanup and no direct setState without mount guard
  useEffect(() => {
    if (!playSessionId) return

    const abortController = new AbortController()
    let isMounted = true

    const statuses = [
      "CONFIRMED",
      "WAITLISTED",
      "ON_HOLD",
      "REQUESTED",
    ] as const

    const fetchStatus = async (status: (typeof statuses)[number]) => {
      const params = new URLSearchParams()
      params.set("status", status)
      params.set("playSessionId", String(playSessionId))

      const res = await fetch(`/participants?${params.toString()}`, {
        signal: abortController.signal,
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `Failed to fetch status=${status}`)
      }
      return res.json() as Promise<UnknownArray>
    }

    const runFetch = async () => {
      if (!isMounted) return
      setIsFetching(true)
      setFetchError(null)

      try {
        const results = await Promise.all(
          statuses.map((s) =>
            fetchStatus(s).catch((err) => ({ __error: String(err) }))
          )
        )

        if (!isMounted) return

        const next: Record<string, UnknownArray | null> = {
          CONFIRMED: null,
          WAITLISTED: null,
          ON_HOLD: null,
          REQUESTED: null,
        }

        results.forEach((r, i) => {
          const status = statuses[i]
          if (r && typeof r === "object" && "__error" in r) {
            setFetchError((prev) =>
              prev
                ? `${prev}; ${status}: ${r.__error}`
                : `${status}: ${r.__error}`
            )
            next[status] = null
          } else {
            next[status] = Array.isArray(r) ? r : []
          }
        })

        setFetchedByStatus(next)
      } catch (err) {
        if (!isMounted) return
        setFetchError(String(err))
      } finally {
        if (isMounted) {
          setIsFetching(false)
        }
      }
    }

    runFetch()

    return () => {
      isMounted = false
      abortController.abort()
    }
  }, [playSessionId])

  const slotLimit = toSlotCountValue(maxSlots)
  const usedConfirmedSlots = officialParticipants.length
  const officialEmptySlotsCount =
    slotLimit !== null ? Math.max(0, slotLimit - usedConfirmedSlots) : 0

  if (error) {
    return (
      <Card className="mt-6">
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Danh sách người tham gia</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {guestsError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{guestsError}</AlertDescription>
          </Alert>
        )}

        <GuestRequestDialog
          playSessionId={playSessionId}
          groupId={groupId}
          isHost={isHost}
          open={openGuestDialog}
          onOpenChange={setOpenGuestDialog}
        />

        {/* Danh sách tham gia chính thức */}
        <div className="h-0.5 w-full bg-gray-500" />
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Danh sách chính thức</h3>
            <Badge variant="secondary">
              {usedConfirmedSlots}
              {typeof maxSlots === "number" && Number.isFinite(maxSlots)
                ? ` / ${maxSlots}`
                : ""}
            </Badge>
          </div>
          <div className="h-0.5 w-full bg-gray-500" />

          {officialParticipants.length === 0 &&
          officialEmptySlotsCount === 0 ? (
            <p className="text-sm text-muted-foreground">
              Chưa có người tham gia chính thức.
            </p>
          ) : (
            <ParticipantsGrid
              participants={officialParticipants}
              emptySlotsCount={officialEmptySlotsCount}
              selectedParticipantId={selectedParticipant?.id}
              onSelect={setSelectedParticipant}
              onEmptySlotClick={() => setOpenGuestDialog(true)}
            />
          )}
        </div>

        {/* Danh sách chờ */}
        <div className="mt-12 h-0.5 w-full bg-gray-500" />
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Danh sách chờ</h3>
            <Badge variant="secondary">
              {waitlistParticipants.length + waitlistedGuests.length}
            </Badge>
          </div>
          <div className="h-0.5 w-full bg-gray-500" />
          {waitlistParticipants.length === 0 &&
          waitlistedGuests.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Chưa có người trong danh sách chờ.
            </p>
          ) : (
            <div className="space-y-3">
              {waitlistParticipants.length > 0 && (
                <ParticipantsGrid
                  participants={waitlistParticipants}
                  selectedParticipantId={selectedParticipant?.id}
                  onSelect={setSelectedParticipant}
                />
              )}
              {waitlistedGuests.length > 0 && (
                <div className="space-y-2">
                  {waitlistedGuests.map((guest) => (
                    <div
                      key={guest.id}
                      className="rounded-md border border-dashed p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium">{guest.name}</p>
                        <Badge variant="outline">
                          {toDisplayGuestType(guest.type)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Danh sách giữ chỗ */}
        <div className="mt-12 h-0.5 w-full bg-gray-500" />
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Danh sách giữ chỗ</h3>
            <Badge variant="secondary">
              {onHoldParticipants.length + onHoldGuests.length}
            </Badge>
          </div>
          <div className="h-0.5 w-full bg-gray-500" />
          {onHoldParticipants.length === 0 && onHoldGuests.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Chưa có người trong danh sách giữ chỗ.
            </p>
          ) : (
            <div className="space-y-3">
              {onHoldParticipants.length > 0 && (
                <ParticipantsGrid
                  participants={onHoldParticipants}
                  selectedParticipantId={selectedParticipant?.id}
                  onSelect={setSelectedParticipant}
                />
              )}
              {onHoldGuests.length > 0 && (
                <div className="space-y-2">
                  {onHoldGuests.map((guest) => (
                    <div
                      key={guest.id}
                      className="rounded-md border border-dashed p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium">{guest.name}</p>
                        <Badge variant="outline">
                          {toDisplayGuestType(guest.type)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Danh sách khách yêu cầu */}
        <div className="mt-12 h-0.5 w-full bg-gray-500" />
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Danh sách khách yêu cầu</h3>
            <Badge variant="secondary">{requestedGuests.length}</Badge>
          </div>
          <div className="h-0.5 w-full bg-gray-500" />
          {requestedGuests.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Chưa có khách yêu cầu.
            </p>
          ) : (
            <div className="space-y-2">
              {requestedGuests.map((guest) => (
                <div
                  key={guest.id}
                  className="rounded-md border border-dashed p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{guest.name}</p>
                    <Badge variant="outline">
                      {toDisplayGuestType(guest.type)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      <Dialog
        open={selectedParticipant !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedParticipant(null)
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Chi tiet nguoi tham gia</DialogTitle>
            <DialogDescription>
              Xem thong tin va cap nhat trang thai cho nguoi tham gia.
            </DialogDescription>
          </DialogHeader>

          <PlaySessionParticipantDetail
            maxSlots={maxSlots}
            participant={selectedParticipant}
            showCard={false}
            onCancel={() => setSelectedParticipant(null)}
          />
        </DialogContent>
      </Dialog>
    </Card>
  )
}
