import { atom } from "jotai"

import type { SessionUser } from "../types"

// User atom - stores minimal session user data (id + email only)
export const userAtom = atom<SessionUser | null>(null)

// Derived atom - user is authenticated when userAtom is set
export const isAuthenticatedAtom = atom((get) => get(userAtom) !== null)

// Action atom - set user data
export const setUserAtom = atom(null, (_get, set, user: SessionUser | null) => {
  set(userAtom, user)
})
