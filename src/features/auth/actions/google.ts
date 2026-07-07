"use server"

import axios from "axios"
import { redirect } from "next/navigation"

import { getAuthenticatedAxios } from "@/lib/server-api"
import { getSession } from "@/lib/session"

import type { AuthActionState } from "."

const API_BASE_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || ""

// ============================================
// Login / Register with Google
// ============================================

export async function loginWithGoogleAction(
  idToken: string
): Promise<AuthActionState> {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/google`, {
      idToken,
    })
    const { accessToken, refreshToken, expiresIn, user } = response.data

    const session = await getSession()
    session.user = { id: user.id, email: user.email }
    session.accessToken = accessToken
    session.refreshToken = refreshToken
    session.accessTokenExpiresAt = Date.now() + expiresIn * 1000
    await session.save()
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      const responseData = error.response?.data as
        | { message?: string | string[]; error?: string }
        | undefined
      const backendMessage = Array.isArray(responseData?.message)
        ? responseData.message.join(", ")
        : responseData?.message || responseData?.error

      if (status === 403) {
        return { error: "Your account has been disabled." }
      }

      if (backendMessage) {
        return { error: backendMessage }
      }

      if (error.code === "ECONNREFUSED") {
        return {
          error:
            "Could not connect to API Gateway. Check the API Gateway URL and docker services.",
        }
      }

      return {
        error: `Login failed (${status ?? "network"}). Please try again.`,
      }
    }
    return { error: "Something went wrong. Please try again." }
  }

  redirect("/")
}

// ============================================
// Link Google
// ============================================

export async function linkGoogleAction(
  idToken: string
): Promise<AuthActionState> {
  try {
    const authenticatedAxios = await getAuthenticatedAxios()
    await authenticatedAxios.post("/api/auth/google/link", { idToken })
    return {
      success: true,
      message: "Google account linked successfully.",
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data as
        | { message?: string | string[]; error?: string }
        | undefined
      const backendMessage = Array.isArray(responseData?.message)
        ? responseData.message.join(", ")
        : responseData?.message || responseData?.error

      return {
        error: backendMessage || "Link failed. Please try again.",
      }
    }
    return { error: "Something went wrong. Please try again." }
  }
}
