import { create } from "zustand"

interface PlaySessionState {
  tabValue: string
  setTabValue: (v: string) => void
  matchDialogOpen: boolean
  setMatchDialogOpen: (open: boolean) => void
  reset: () => void
}

export const usePlaySessionStore = create<PlaySessionState>((set) => ({
  tabValue: "0",
  setTabValue: (v: string) => set({ tabValue: v }),
  matchDialogOpen: false,
  setMatchDialogOpen: (open: boolean) => set({ matchDialogOpen: open }),
  reset: () => set({ tabValue: "0", matchDialogOpen: false }),
}))

export default usePlaySessionStore
