import { create } from "zustand"

import type { ListSocial as Social } from "../types/social"

interface SocialsState {
  selectedSocial: Social | null
  setSelectedSocial: (social: Social | null) => void
}

export const useSocialsStore = create<SocialsState>((set) => ({
  selectedSocial: null,
  setSelectedSocial: (social: Social | null) => set({ selectedSocial: social }),
}))
