import { getIronSession } from "iron-session"
import { cookies } from "next/headers"

export interface SessionUser {
  id: string
  email: string
  name?: string | null
  phoneNumber?: string | null
}

export interface SessionData {
  user?: SessionUser
  accessToken?: string
  refreshToken?: string
  accessTokenExpiresAt?: number
}

export const sessionOptions = {
  cookieName: "picklehub-session",
  password: process.env.SESSION_SECRET as string,
  cookieOptions: {
    // httpOnly: true,
    // secure only works in `https` environments
    // if your localhost is not on `https`, then use: `secure: process.env.NODE_ENV === "production"`
    secure: process.env.NODE_ENV === "production",
    // sameSite: "lax" as const,
    // path: "/",
  },
}

export async function getSession() {
  "use server"
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, sessionOptions)
}
