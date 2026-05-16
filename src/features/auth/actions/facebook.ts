"use server"

import axios from "axios"

import { getSession } from "@/lib/session"

import type { AuthActionState } from "."

const API_BASE_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || ""

// ============================================
// Login / Register with Facebook
// ============================================

export async function loginWithFacebookAction(
  accessToken: string
): Promise<AuthActionState> {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/facebook`, {
      accessToken,
    })
    const {
      accessToken: sessionToken,
      refreshToken,
      expiresIn,
      user,
    } = response.data

    const session = await getSession()
    session.user = { id: user.id, email: user.email }
    session.accessToken = sessionToken
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
        return { error: "Tài khoản của bạn đã bị vô hiệu hóa." }
      }

      if (backendMessage) {
        return { error: backendMessage }
      }

      return {
        error: `Đăng nhập thất bại (${status ?? "network"}). Vui lòng thử lại.`,
      }
    }
    return { error: "Đã có lỗi xảy ra. Vui lòng thử lại." }
  }

  return {}
}

// ============================================
// Link Facebook
// ============================================

export async function linkFacebookAction(
  accessToken: string
): Promise<AuthActionState> {
  try {
    const { getAuthenticatedAxios } = await import("@/lib/server-api")
    const authenticatedAxios = await getAuthenticatedAxios()
    await authenticatedAxios.post("/api/auth/facebook/link", { accessToken })
    return {
      success: true,
      message: "Đã liên kết tài khoản Facebook thành công.",
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
        error: backendMessage || "Liên kết thất bại. Vui lòng thử lại.",
      }
    }
    return { error: "Đã có lỗi xảy ra. Vui lòng thử lại." }
  }
}
