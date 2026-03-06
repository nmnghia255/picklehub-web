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
    console.log(response)
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
      if (status === 403) {
        return { error: "Tài khoản của bạn đã bị vô hiệu hóa." }
      }
      return {
        error:
          error.response?.data?.message ||
          "Đăng nhập thất bại. Vui lòng thử lại.",
      }
    }
    return { error: "Đã có lỗi xảy ra. Vui lòng thử lại." }
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
      message: "Đã liên kết tài khoản Google thành công.",
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        error:
          error.response?.data?.message ||
          "Liên kết thất bại. Vui lòng thử lại.",
      }
    }
    return { error: "Đã có lỗi xảy ra. Vui lòng thử lại." }
  }
}
