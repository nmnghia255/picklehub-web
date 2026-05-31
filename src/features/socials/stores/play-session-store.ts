import { create } from "zustand"

interface PlaySessionState {
  tabValue: string
  setTabValue: (v: string) => void
  reset: () => void
}

export const usePlaySessionStore = create<PlaySessionState>((set) => ({
  tabValue: "0",
  setTabValue: (v: string) => set({ tabValue: v }),
  reset: () => set({ tabValue: "0" }),
}))

export default usePlaySessionStore
