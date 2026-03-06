"use server"

import axios from "axios"
import { redirect } from "next/navigation"

import { getSession } from "@/lib/session"

import {
  loginSchema,
  registerSchema,
  resendVerificationSchema,
  verifyEmailSchema,
} from "../schemas"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || ""

export interface AuthActionState {
  error?: string
  success?: boolean
  message?: string
}

// ============================================
// Login
// ============================================

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/auth/login`,
      parsed.data
    )
    const { accessToken, refreshToken, expiresIn, user } = response.data

    const session = await getSession()
    session.user = { id: user.id, email: user.email }
    session.accessToken = accessToken
    session.refreshToken = refreshToken
    session.accessTokenExpiresAt = Date.now() + expiresIn * 1000
    await session.save()
  } catch (error) {
    if (axios.isAxiosError(error)) {
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
// Register
// ============================================

export async function registerAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
  })

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  try {
    await axios.post(`${API_BASE_URL}/api/auth/register`, parsed.data)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        error:
          error.response?.data?.message ||
          "Đăng ký thất bại. Vui lòng thử lại.",
      }
    }
    return { error: "Đã có lỗi xảy ra. Vui lòng thử lại." }
  }

  redirect(
    `/register/verify-email?email=${encodeURIComponent(parsed.data.email)}`
  )
}

// ============================================
// Verify Email
// ============================================

export async function verifyEmailAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = verifyEmailSchema.safeParse({
    token: formData.get("token"),
  })

  if (!parsed.success) {
    return { error: "Token không hợp lệ." }
  }

  try {
    await axios.post(`${API_BASE_URL}/api/auth/verify-email`, parsed.data)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        error:
          error.response?.data?.message ||
          "Xác thực thất bại. Link có thể đã hết hạn.",
      }
    }
    return { error: "Đã có lỗi xảy ra. Vui lòng thử lại." }
  }

  redirect("/login")
}

// ============================================
// Resend Verification
// ============================================

export async function resendVerificationAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = resendVerificationSchema.safeParse({
    email: formData.get("email"),
  })

  if (!parsed.success) {
    return { error: "Email không hợp lệ." }
  }

  try {
    await axios.post(
      `${API_BASE_URL}/api/auth/resend-verification`,
      parsed.data
    )
    return { success: true, message: "Email xác thực đã được gửi lại!" }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        error: error.response?.data?.message || "Gửi lại thất bại.",
      }
    }
    return { error: "Đã có lỗi xảy ra. Vui lòng thử lại." }
  }
}

// ============================================
// Logout
// ============================================

export async function logoutAction() {
  const session = await getSession()
  session.destroy()
  redirect("/login")
}
