import { create } from "zustand"

import type { PlaySession } from "@/features/socials/types/play-session"

interface SocialDetailState {
  joinDialogOpen: boolean
  setJoinDialogOpen: (open: boolean) => void
  leaveDialogOpen: boolean
  setLeaveDialogOpen: (open: boolean) => void
  playSessionModalOpen: boolean
  setPlaySessionModalOpen: (open: boolean) => void
  selectedSession: PlaySession | null
  setSelectedSession: (s: PlaySession | null) => void
  tabValue: string
  setTabValue: (v: string) => void
  inviteDialogOpen: boolean
  setInviteDialogOpen: (open: boolean) => void
  reset: () => void
}

export const useSocialDetailStore = create<SocialDetailState>((set) => ({
  joinDialogOpen: false,
  setJoinDialogOpen: (open: boolean) => set({ joinDialogOpen: open }),
  leaveDialogOpen: false,
  setLeaveDialogOpen: (open: boolean) => set({ leaveDialogOpen: open }),
  playSessionModalOpen: false,
  setPlaySessionModalOpen: (open: boolean) =>
    set({ playSessionModalOpen: open }),
  selectedSession: null,
  setSelectedSession: (s: PlaySession | null) => set({ selectedSession: s }),
  tabValue: "0",
  setTabValue: (v: string) => set({ tabValue: v }),
  inviteDialogOpen: false,
  setInviteDialogOpen: (open: boolean) => set({ inviteDialogOpen: open }),
  reset: () =>
    set({
      joinDialogOpen: false,
      leaveDialogOpen: false,
      playSessionModalOpen: false,
      selectedSession: null,
      tabValue: "0",
      inviteDialogOpen: false,
    }),
}))

export default useSocialDetailStore
